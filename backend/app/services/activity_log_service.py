import uuid
from enum import Enum
from typing import Any

from sqlalchemy.orm import Session

from app.repositories.activity_log_repository import ActivityLogRepository


class ActivityLogAction(str, Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    FAILED_LOGIN = "FAILED_LOGIN"


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
