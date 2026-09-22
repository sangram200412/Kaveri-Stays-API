from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Integer,
    SmallInteger,
    String,
    Text,
    DateTime,
    Numeric,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import DATERANGE
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    guest_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("guests.guest_id"),
        nullable=False
    )

    room_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("rooms.room_id"),
        nullable=False
    )

    stay: Mapped[tuple[date, date]] = mapped_column(
        DATERANGE,
        nullable=False
    )

    guests_count: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False
    )

    nightly_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(11),
        nullable=False
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )