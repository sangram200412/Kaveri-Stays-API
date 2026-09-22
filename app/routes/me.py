from fastapi import APIRouter, Depends

from app.auth import get_current_account
from app.models.account import Account
from app.schemas.account import MeResponse


router = APIRouter(
    tags=["Authentication"]
)


@router.get(
    "/me",
    response_model=MeResponse
)
def get_me(
    current_account: Account = Depends(get_current_account)
):
    return current_account