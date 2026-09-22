from pydantic import BaseModel, ConfigDict


class AccountCreate(BaseModel):
    email: str
    password: str
    role: str
    property_id: int | None = None
    guest_id: int | None = None


class AccountResponse(BaseModel):
    account_id: int
    email: str
    role: str
    property_id: int | None
    guest_id: int | None

    model_config = ConfigDict(from_attributes=True)


class MeResponse(BaseModel):
    account_id: int
    email: str
    role: str
    property_id: int | None = None
    guest_id: int | None = None

    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str