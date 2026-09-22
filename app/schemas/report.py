from datetime import date

from pydantic import BaseModel


class OccupancyResponse(BaseModel):
    property_id: int
    month: date
    occupancy_rate: float


class ADRResponse(BaseModel):
    property_id: int
    month: date
    adr: float


class RevPARResponse(BaseModel):
    property_id: int
    month: date
    revpar: float