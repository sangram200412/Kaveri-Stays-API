from pydantic import BaseModel, ConfigDict


class RoomTypeCreate(BaseModel):
    type_name: str
    max_occupancy: int


class RoomTypeResponse(BaseModel):
    room_type_id: int
    type_name: str
    max_occupancy: int

    model_config = ConfigDict(from_attributes=True)