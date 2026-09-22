from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class RatePlanCreate(BaseModel):
    property_id: int
    room_type_id: int
    start_date: date
    end_date: date
    nightly_rate: Decimal = Field(gt=0)


class RatePlanResponse(BaseModel):
    rate_plan_id: int
    property_id: int
    room_type_id: int
    start_date: date
    end_date: date
    nightly_rate: Decimal

    model_config = ConfigDict(from_attributes=True)