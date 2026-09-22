from datetime import datetime
from decimal import Decimal

from sqlalchemy import Integer, Numeric, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Payment(Base):
    __tablename__ = "payments"

    payment_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    booking_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("bookings.booking_id"),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    method: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    idempotency_key: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True
    )