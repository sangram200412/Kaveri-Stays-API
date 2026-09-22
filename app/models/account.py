from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Account(Base):
    __tablename__ = "accounts"

    account_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    email: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    property_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("properties.property_id"),
        nullable=True
    )

    guest_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("guests.guest_id"),
        nullable=True
    )