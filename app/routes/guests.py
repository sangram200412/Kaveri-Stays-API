from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import get_current_account
from app.models.guest import Guest
from app.schemas.guest import GuestCreate, GuestResponse


router = APIRouter(
    prefix="/guests",
    tags=["Guests"]
)


@router.get(
    "/",
    response_model=list[GuestResponse]
)
def get_guests(
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    guests = db.query(Guest).order_by(Guest.guest_id).all()

    return guests


@router.get(
    "/{guest_id}",
    response_model=GuestResponse
)
def get_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    guest = db.query(Guest).filter(
        Guest.guest_id == guest_id
    ).first()

    if guest is None:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    return guest


@router.post(
    "/",
    response_model=GuestResponse,
    status_code=201
)
def create_guest(
    guest_data: GuestCreate,
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    # Only staff, manager, owner can create guests
    if current_account.role not in {"staff", "manager", "owner"}:
        raise HTTPException(
            status_code=403,
            detail="Staff, manager or owner access required"
        )

    new_guest = Guest(
        full_name=guest_data.full_name,
        email=guest_data.email,
        phone=guest_data.phone,
        city=guest_data.city
    )

    db.add(new_guest)
    db.commit()
    db.refresh(new_guest)

    return new_guest