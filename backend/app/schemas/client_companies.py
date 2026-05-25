import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClientCompanyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    tax_code: str
    address: str | None
    created_by_user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
