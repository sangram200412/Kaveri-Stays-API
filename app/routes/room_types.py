from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.room_type import RoomType
from app.schemas.room_type import RoomTypeCreate, RoomTypeResponse
from app.auth import get_current_account
from app.models.account import Account


router = APIRouter(
    prefix="/room-types",
    tags=["Room Types"]
)


# ============================================================
# GET ALL ROOM TYPES
# ============================================================

@router.get(
    "/",
    response_model=list[RoomTypeResponse],
    status_code=200
)
def get_room_types(
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account)
):
    room_types = (
        db.query(RoomType)
        .order_by(RoomType.room_type_id)
        .all()
    )

    return room_types


# ============================================================
# GET ROOM TYPE BY ID
# ============================================================

@router.get(
    "/{room_type_id}",
    response_model=RoomTypeResponse,
    status_code=200
)
def get_room_type(
    room_type_id: int,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account)
):

    room_type = (
        db.query(RoomType)
        .filter(RoomType.room_type_id == room_type_id)
        .first()
    )

    if room_type is None:
        raise HTTPException(
            status_code=404,
            detail="Room type not found"
        )

    return room_type


# ============================================================
# CREATE ROOM TYPE
# ============================================================

@router.post(
    "/",
    response_model=RoomTypeResponse,
    status_code=201
)
def create_room_type(
    room_type_data: RoomTypeCreate,
    db: Session = Depends(get_db),
    current_account: Account = Depends(get_current_account)
):

    # Only owner can create room types
    if current_account.role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Owner access required"
        )

    # Check duplicate room type name
    existing_room_type = (
        db.query(RoomType)
        .filter(RoomType.type_name == room_type_data.type_name)
        .first()
    )

    if existing_room_type:
        raise HTTPException(
            status_code=409,
            detail="Room type already exists"
        )

    # Validate occupancy
    if room_type_data.max_occupancy <= 0:
        raise HTTPException(
            status_code=400,
            detail="Maximum occupancy must be greater than 0"
        )

    new_room_type = RoomType(
        type_name=room_type_data.type_name,
        max_occupancy=room_type_data.max_occupancy
    )

    db.add(new_room_type)

    try:
        db.commit()
        db.refresh(new_room_type)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Unable to create room type"
        )

    return new_room_type