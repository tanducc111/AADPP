import uuid
from enum import Enum
from typing import Any

from sqlalchemy.orm import Session

from app.repositories.activity_log_repository import ActivityLogRepository


class ActivityLogAction(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    FAILED_LOGIN = "FAILED_LOGIN"
    CREATE_CLIENT_COMPANY = "CREATE_CLIENT_COMPANY"
    UPDATE_CLIENT_COMPANY = "UPDATE_CLIENT_COMPANY"
    DELETE_CLIENT_COMPANY = "DELETE_CLIENT_COMPANY"
    ACTIVATE_CLIENT_COMPANY = "ACTIVATE_CLIENT_COMPANY"
    DEACTIVATE_CLIENT_COMPANY = "DEACTIVATE_CLIENT_COMPANY"
    UPLOAD_DOCUMENT = "UPLOAD_DOCUMENT"
    VIEW_DOCUMENT = "VIEW_DOCUMENT"
    DOWNLOAD_DOCUMENT = "DOWNLOAD_DOCUMENT"
    DELETE_DOCUMENT = "DELETE_DOCUMENT"


class ActivityLogService:
    def __init__(self, database_session: Session) -> None:
        self.activity_log_repository = ActivityLogRepository(database_session)

    def record_auth_event(
        self,
        action: ActivityLogAction,
        user_id: uuid.UUID | None = None,
        description: str | None = None,
        event_metadata: dict[str, Any] | None = None,
    ) -> None:
        self.activity_log_repository.create_activity_log(
            action=action.value,
            user_id=user_id,
            description=description,
            event_metadata=event_metadata,
        )

    def record_client_company_event(
        self,
        action: ActivityLogAction,
        user_id: uuid.UUID,
        description: str,
        event_metadata: dict[str, Any] | None = None,
    ) -> None:
        self.activity_log_repository.create_activity_log(
            action=action.value,
            user_id=user_id,
            description=description,
            event_metadata=event_metadata,
        )

    def record_document_event(
        self,
        action: ActivityLogAction,
        user_id: uuid.UUID,
        description: str,
        document_id: uuid.UUID | None = None,
        event_metadata: dict[str, Any] | None = None,
    ) -> None:
        self.activity_log_repository.create_activity_log(
            action=action.value,
            user_id=user_id,
            document_id=document_id,
            description=description,
            event_metadata=event_metadata,
        )
