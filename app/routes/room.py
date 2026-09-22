from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.dialects.postgresql import Range
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import get_current_account
from app.models.room import Room
from app.models.booking import Booking
from app.models.property import Property
from app.models.room_type import RoomType
from app.schemas.room import RoomCreate, RoomResponse


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


@router.get(
    "/",
    response_model=list[RoomResponse]
)
def get_rooms(
    property_id: int | None = None,
    room_type_id: int | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Room)

    if property_id is not None:
        query = query.filter(Room.property_id == property_id)

    if room_type_id is not None:
        query = query.filter(Room.room_type_id == room_type_id)

    return query.order_by(Room.room_id).all()


@router.get(
    "/availability",
    response_model=list[RoomResponse]
)
def get_available_rooms(
    start_date: date,
    end_date: date,
    property_id: int | None = None,
    room_type_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Return rooms that have no overlapping confirmed/checked_in/checked_out
    bookings for the given date range.
    """

    if start_date >= end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
        )

    requested_range = Range(
        start_date,
        end_date,
        bounds="[)"
    )

    # Find all room IDs that are occupied in this range
    occupied_room_ids = (
        db.query(Booking.room_id)
        .filter(
            Booking.stay.op("&&")(requested_range),
            Booking.status.notin_(["cancelled", "no_show"])
        )
        .distinct()
        .subquery()
    )

    query = (
        db.query(Room)
        .filter(Room.room_id.notin_(occupied_room_ids))
    )

    if property_id is not None:
        query = query.filter(Room.property_id == property_id)

    if room_type_id is not None:
        query = query.filter(Room.room_type_id == room_type_id)

    return query.order_by(Room.room_id).all()


@router.get(
    "/{room_id}",
    response_model=RoomResponse
)
def get_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(
        Room.room_id == room_id
    ).first()

    if room is None:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    return room


@router.post(
    "/",
    response_model=RoomResponse,
    status_code=201
)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    # Only owner or manager can create rooms
    if current_account.role not in {"owner", "manager"}:
        raise HTTPException(
            status_code=403,
            detail="Owner or manager access required"
        )

    # Validate property exists
    property_obj = db.query(Property).filter(
        Property.property_id == room_data.property_id
    ).first()

    if property_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    # Validate room type exists
    room_type = db.query(RoomType).filter(
        RoomType.room_type_id == room_data.room_type_id
    ).first()

    if room_type is None:
        raise HTTPException(
            status_code=404,
            detail="Room type not found"
        )

    new_room = Room(
        property_id=room_data.property_id,
        room_number=room_data.room_number,
        room_type_id=room_data.room_type_id
    )

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room