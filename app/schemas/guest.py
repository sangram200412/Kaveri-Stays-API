from pydantic import BaseModel, ConfigDict


class GuestCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    city: str


class GuestResponse(BaseModel):
    guest_id: int
    full_name: str
    email: str
    phone: str
    city: str

    model_config = ConfigDict(from_attributes=True)