from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db_session
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    AuthenticatedUser,
    GoogleLoginRequest,
    LogoutResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/google", response_model=AuthResponse)
async def login_with_google(
    login_request: GoogleLoginRequest,
    database_session: Session = Depends(get_db_session),
) -> AuthResponse:
    auth_service = AuthService(database_session)

    return auth_service.authenticate_google_user(login_request.id_token)


@router.get("/me", response_model=AuthenticatedUser)
async def read_current_user(
    current_user: User = Depends(get_current_user),
) -> AuthenticatedUser:
    return AuthenticatedUser.model_validate(current_user)


@router.post("/logout", response_model=LogoutResponse)
async def logout_current_user(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_db_session),
) -> LogoutResponse:
    auth_service = AuthService(database_session)
    auth_service.logout_user(current_user)

    return LogoutResponse(success=True, message="Logged out successfully.")
