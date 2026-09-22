from datetime import date
from decimal import Decimal

from sqlalchemy import Integer, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import DATERANGE
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class RatePlan(Base):
    __tablename__ = "rate_plans"

    rate_plan_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    property_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("properties.property_id"),
        nullable=False
    )

    room_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("room_types.room_type_id"),
        nullable=False
    )

    season_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    valid: Mapped[tuple[date, date]] = mapped_column(
        DATERANGE,
        nullable=False
    )

    nightly_rate: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )