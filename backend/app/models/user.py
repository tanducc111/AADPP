from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import UserRole
from app.models.mixins import UUIDTimestampMixin

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.client_company import ClientCompany
    from app.models.document import Document


class User(Base, UUIDTimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_roles"),
        nullable=False,
        default=UserRole.ACCOUNTANT,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    client_companies: Mapped[list["ClientCompany"]] = relationship(back_populates="created_by")
    uploaded_documents: Mapped[list["Document"]] = relationship(back_populates="uploaded_by")
    activity_logs: Mapped[list["ActivityLog"]] = relationship(back_populates="user")
