from pydantic import BaseModel, ConfigDict


class PropertyCreate(BaseModel):
    property_name: str
    city: str
    star_rating: int


class PropertyResponse(BaseModel):
    property_id: int
    property_name: str
    city: str
    star_rating: int

    model_config = ConfigDict(from_attributes=True)