import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.repositories.base import BaseRepository


class ActivityLogRepository(BaseRepository[ActivityLog]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(ActivityLog, database_session)

    def create_activity_log(
        self,
        action: str,
        user_id: uuid.UUID | None = None,
        document_id: uuid.UUID | None = None,
        description: str | None = None,
        event_metadata: dict[str, Any] | None = None,
    ) -> ActivityLog:
        activity_log = ActivityLog(
            user_id=user_id,
            document_id=document_id,
            action=action,
            description=description,
            event_metadata=event_metadata,
        )

        return self.add(activity_log)
