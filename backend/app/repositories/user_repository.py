import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, database_session: Session) -> None:
        super().__init__(User, database_session)

    def get_by_email(self, email: str) -> User | None:
        normalized_email = email.lower()
        statement = select(User).where(User.email == normalized_email)

        return self.database_session.scalar(statement)

    def get_by_google_id(self, google_id: str) -> User | None:
        statement = select(User).where(User.google_id == google_id)

        return self.database_session.scalar(statement)

    def count_users(self) -> int:
        statement = select(func.count(User.id))

        return self.database_session.scalar(statement) or 0

    def get_by_id(self, model_id: uuid.UUID) -> User | None:
        return super().get_by_id(model_id)
