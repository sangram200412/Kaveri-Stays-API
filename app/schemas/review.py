from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class ReviewCreate(BaseModel):
    booking_id: int
    rating: int = Field(
        ge=1,
        le=5
    )
    review_text: str | None = None


class ReviewResponse(BaseModel):
    review_id: int
    booking_id: int
    rating: int
    review_text: str | None
    reviewed_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )