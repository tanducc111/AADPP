import uuid
from typing import Generic, TypeVar

from sqlalchemy.orm import Session

from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model_class: type[ModelType], database_session: Session) -> None:
        self.model_class = model_class
        self.database_session = database_session

    def get_by_id(self, model_id: uuid.UUID) -> ModelType | None:
        return self.database_session.get(self.model_class, model_id)

    def add(self, model_instance: ModelType) -> ModelType:
        self.database_session.add(model_instance)
        return model_instance
