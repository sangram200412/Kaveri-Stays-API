from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


class PaymentCreate(BaseModel):
    amount: Decimal = Field(
        gt=0,
        decimal_places=2
    )

    method: str

    idempotency_key: str = Field(
        min_length=1,
        max_length=255
    )


class PaymentResponse(BaseModel):
    payment_id: int
    booking_id: int
    amount: Decimal
    method: str
    paid_at: datetime
    idempotency_key: str | None = None

    model_config = ConfigDict(
        from_attributes=True
    )