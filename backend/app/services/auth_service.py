from sqlalchemy.orm import Session

from app.core.exceptions import AccountAccessBlockedError, AppException
from app.core.security import create_access_token
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import AuthResponse, AuthenticatedUser
from app.services.activity_log_service import ActivityLogAction, ActivityLogService
from app.services.google_token_service import verify_google_id_token
from app.utils.datetime import utc_now


class AuthService:
    def __init__(self, database_session: Session) -> None:
        self.database_session = database_session
        self.user_repository = UserRepository(database_session)
        self.activity_log_service = ActivityLogService(database_session)

    def authenticate_google_user(self, id_token: str) -> AuthResponse:
        try:
            google_user = verify_google_id_token(id_token)
        except AppException as auth_error:
            self.activity_log_service.record_auth_event(
                action=ActivityLogAction.FAILED_LOGIN,
                description=auth_error.message,
                event_metadata={"provider": "google"},
            )
            self.database_session.commit()
            raise

        current_user = self.user_repository.get_by_email(str(google_user.email))

        if current_user and (not current_user.is_active or current_user.is_locked):
            self.activity_log_service.record_auth_event(
                action=ActivityLogAction.FAILED_LOGIN,
                user_id=current_user.id,
                description="Blocked login attempt for inactive or locked account.",
                event_metadata={
                    "email": current_user.email,
                    "provider": "google",
                },
            )
            self.database_session.commit()
            raise AccountAccessBlockedError()

        if not current_user:
            current_user = self._create_google_user(
                email=str(google_user.email),
                full_name=google_user.full_name,
                avatar_url=google_user.avatar_url,
                google_id=google_user.google_id,
            )
        else:
            self._sync_google_profile(
                current_user=current_user,
                full_name=google_user.full_name,
                avatar_url=google_user.avatar_url,
                google_id=google_user.google_id,
            )

        current_user.last_login_at = utc_now()
        self.activity_log_service.record_auth_event(
            action=ActivityLogAction.LOGIN,
            user_id=current_user.id,
            description="User logged in with Google SSO.",
            event_metadata={"provider": "google", "email": current_user.email},
        )
        self.database_session.commit()
        self.database_session.refresh(current_user)

        access_token = create_access_token(
            subject=str(current_user.id),
            additional_claims={"role": current_user.role.value},
        )

        return AuthResponse(
            access_token=access_token,
            user=AuthenticatedUser.model_validate(current_user),
        )

    def logout_user(self, current_user: User) -> None:
        self.activity_log_service.record_auth_event(
            action=ActivityLogAction.LOGOUT,
            user_id=current_user.id,
            description="User logged out.",
            event_metadata={"email": current_user.email},
        )
        self.database_session.commit()

    def _create_google_user(
        self,
        email: str,
        full_name: str,
        avatar_url: str | None,
        google_id: str,
    ) -> User:
        assigned_role = (
            UserRole.ADMIN
            if self.user_repository.count_users() == 0
            else UserRole.ACCOUNTANT
        )
        new_user = User(
            email=email.lower(),
            password_hash=None,
            full_name=full_name,
            avatar_url=avatar_url,
            google_id=google_id,
            role=assigned_role,
            is_active=True,
            is_locked=False,
        )

        return self.user_repository.add(new_user)

    def _sync_google_profile(
        self,
        current_user: User,
        full_name: str,
        avatar_url: str | None,
        google_id: str,
    ) -> None:
        current_user.full_name = full_name
        current_user.avatar_url = avatar_url
        current_user.google_id = google_id
