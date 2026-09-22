from pydantic import BaseModel, ConfigDict


class RoomCreate(BaseModel):
    property_id: int
    room_number: str
    room_type_id: int


class RoomResponse(BaseModel):
    room_id: int
    property_id: int
    room_number: str
    room_type_id: int

    model_config = ConfigDict(from_attributes=True)