from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class StayRange(BaseModel):
    start_date: date
    end_date: date


class BookingCreate(BaseModel):
    guest_id: int
    room_id: int
    stay: StayRange
    guests_count: int = Field(gt=0)
    nightly_rate: Decimal | None = Field(default=None, gt=0)

    status: Literal[
    "confirmed",
    "checked_in",
    "checked_out",
    "cancelled",
    "no_show"
] = "confirmed"

    notes: str | None = None


class BookingUpdate(BaseModel):
    status: Literal[
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show"
    ] | None = None

    notes: str | None = None


class BookingResponse(BaseModel):
    booking_id: int
    guest_id: int
    room_id: int
    stay: StayRange
    guests_count: int
    nightly_rate: Decimal
    status: str
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)