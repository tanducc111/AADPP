import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class ActivityLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID | None
    document_id: uuid.UUID | None
    action: str
    description: str | None
    event_metadata: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
