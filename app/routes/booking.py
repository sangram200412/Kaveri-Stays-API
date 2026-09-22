from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.dialects.postgresql import Range
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import get_current_account

from app.models.booking import Booking
from app.models.guest import Guest
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.rate_plan import RatePlan
from app.models.review import Review

from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
)
from app.schemas.review import ReviewCreate, ReviewResponse


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# =========================================================
# HELPER: CONVERT BOOKING TO RESPONSE
# =========================================================

def booking_to_response(booking: Booking) -> BookingResponse:

    return BookingResponse(
        booking_id=booking.booking_id,
        guest_id=booking.guest_id,
        room_id=booking.room_id,

        stay={
            "start_date": booking.stay.lower,
            "end_date": booking.stay.upper
        },

        guests_count=booking.guests_count,
        nightly_rate=booking.nightly_rate,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at
    )


# =========================================================
# GET ALL BOOKINGS
# WITH FILTERING, SORTING AND PAGINATION
# =========================================================

@router.get(
    "/",
    response_model=list[BookingResponse]
)
def get_bookings(

    # -------------------------
    # FILTERS
    # -------------------------

    property_id: int | None = None,

    status: str | None = None,

    guest_id: int | None = None,

    start_date: date | None = None,

    end_date: date | None = None,

    # -------------------------
    # SORTING
    # -------------------------

    sort: str = "booking_id",

    sort_order: str = "asc",

    # -------------------------
    # PAGINATION
    # -------------------------

    page: int = 1,

    page_size: int = 20,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    # =====================================================
    # 1. VALIDATE PAGINATION
    # =====================================================

    if page < 1:
        raise HTTPException(
            status_code=400,
            detail="page must be greater than or equal to 1"
        )

    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=400,
            detail="page_size must be between 1 and 100"
        )


    # =====================================================
    # 2. VALIDATE DATE RANGE
    # =====================================================

    if start_date and end_date:

        if start_date >= end_date:

            raise HTTPException(
                status_code=400,
                detail="start_date must be before end_date"
            )


    # =====================================================
    # 3. SORT FIELD WHITELIST
    # =====================================================

    allowed_sort_fields = {

        "booking_id": Booking.booking_id,

        "guest_id": Booking.guest_id,

        "room_id": Booking.room_id,

        "guests_count": Booking.guests_count,

        "nightly_rate": Booking.nightly_rate,

        "status": Booking.status,

        "created_at": Booking.created_at
    }


    # =====================================================
    # 4. VALIDATE SORT FIELD
    # =====================================================

    if sort not in allowed_sort_fields:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid sort field. "
                "Allowed fields: "
                "booking_id, guest_id, room_id, "
                "guests_count, nightly_rate, "
                "status, created_at"
            )
        )


    # =====================================================
    # 5. VALIDATE SORT ORDER
    # =====================================================

    if sort_order not in ["asc", "desc"]:

        raise HTTPException(
            status_code=400,
            detail="sort_order must be 'asc' or 'desc'"
        )


    # =====================================================
    # 6. START QUERY
    # =====================================================

    query = db.query(Booking)


    # =====================================================
    # 7. FILTER BY PROPERTY
    # =====================================================

    if property_id is not None:

        query = (
            query
            .join(
                Room,
                Booking.room_id == Room.room_id
            )
            .filter(
                Room.property_id == property_id
            )
        )


    # =====================================================
    # 8. FILTER BY STATUS
    # =====================================================

    if status is not None:

        query = query.filter(
            Booking.status == status
        )


    # =====================================================
    # 9. FILTER BY GUEST
    # =====================================================

    if guest_id is not None:

        query = query.filter(
            Booking.guest_id == guest_id
        )


    # =====================================================
    # 10. FILTER BY DATE RANGE
    # =====================================================

    if start_date and end_date:

        requested_range = Range(
            start_date,
            end_date,
            bounds="[)"
        )

        query = query.filter(
            Booking.stay.op("&&")(requested_range)
        )


    # =====================================================
    # 11. APPLY SORTING
    # =====================================================

    sort_column = allowed_sort_fields[sort]

    if sort_order == "desc":

        query = query.order_by(
            sort_column.desc()
        )

    else:

        query = query.order_by(
            sort_column.asc()
        )


    # =====================================================
    # 12. APPLY PAGINATION
    # =====================================================

    offset = (page - 1) * page_size

    bookings = (
        query
        .offset(offset)
        .limit(page_size)
        .all()
    )


    # =====================================================
    # 13. CONVERT TO RESPONSE MODEL
    # =====================================================

    return [
        booking_to_response(booking)
        for booking in bookings
    ]


# =========================================================
# GET SINGLE BOOKING
# =========================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(

    booking_id: int,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id
        )
        .first()
    )


    if booking is None:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    return booking_to_response(booking)


# =========================================================
# CREATE BOOKING
# =========================================================

@router.post(
    "/",
    response_model=BookingResponse,
    status_code=201
)
def create_booking(

    booking_data: BookingCreate,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    # =====================================================
    # 1. VALIDATE STAY DATES
    # =====================================================

    if booking_data.stay.start_date >= booking_data.stay.end_date:

        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
        )


    # =====================================================
    # 2. CHECK GUEST EXISTS
    # =====================================================

    guest = (
        db.query(Guest)
        .filter(
            Guest.guest_id == booking_data.guest_id
        )
        .first()
    )


    if guest is None:

        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )


    # =====================================================
    # 3. CHECK ROOM EXISTS
    # =====================================================

    room = (
        db.query(Room)
        .filter(
            Room.room_id == booking_data.room_id
        )
        .first()
    )


    if room is None:

        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )


    # =====================================================
    # 4. CHECK ROOM TYPE EXISTS
    # =====================================================

    room_type = (
        db.query(RoomType)
        .filter(
            RoomType.room_type_id == room.room_type_id
        )
        .first()
    )


    if room_type is None:

        raise HTTPException(
            status_code=404,
            detail="Room type not found"
        )


    # =====================================================
    # 5. CHECK ROOM CAPACITY
    # =====================================================

    if booking_data.guests_count > room_type.max_occupancy:

        raise HTTPException(
            status_code=400,
            detail=(
                f"Room can accommodate maximum "
                f"{room_type.max_occupancy} guests"
            )
        )


    # =====================================================
    # 6. CREATE POSTGRESQL DATE RANGE
    # =====================================================

    stay_range = Range(
        booking_data.stay.start_date,
        booking_data.stay.end_date,
        bounds="[)"
    )


    # =====================================================
    # 7. CHECK OVERLAPPING BOOKINGS
    # =====================================================

    overlapping_booking = (
        db.query(Booking)
        .filter(
            Booking.room_id == booking_data.room_id,

            Booking.stay.op("&&")(stay_range),

            Booking.status != "cancelled"
        )
        .first()
    )


    if overlapping_booking is not None:

        raise HTTPException(
            status_code=409,
            detail=(
                "Room is already booked "
                "for the selected dates"
            )
        )


    # =====================================================
    # 8. FIND RATE PLAN
    # =====================================================

    rate_plan = (
        db.query(RatePlan)
        .filter(
            RatePlan.property_id == room.property_id,

            RatePlan.room_type_id == room.room_type_id,

            RatePlan.valid.contains(stay_range)
        )
        .first()
    )


    if rate_plan is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "No rate plan found for "
                "the selected room and dates"
            )
        )


    # =====================================================
    # 9. SERVER-SIDE NIGHTLY RATE
    # =====================================================

    actual_nightly_rate = rate_plan.nightly_rate


    # =====================================================
    # 10. CREATE BOOKING
    # =====================================================

    new_booking = Booking(

        guest_id=booking_data.guest_id,

        room_id=booking_data.room_id,

        stay=stay_range,

        guests_count=booking_data.guests_count,

        nightly_rate=actual_nightly_rate,

        status=booking_data.status,

        notes=booking_data.notes,

        created_at=datetime.now()
    )


    # =====================================================
    # 11. SAVE BOOKING
    # =====================================================

    db.add(new_booking)

    db.commit()

    db.refresh(new_booking)


    # =====================================================
    # 12. RETURN RESPONSE
    # =====================================================

    return booking_to_response(new_booking)


# =========================================================
# PATCH BOOKING — UPDATE STATUS / NOTES
# =========================================================

@router.patch(
    "/{booking_id}",
    response_model=BookingResponse
)
def update_booking(

    booking_id: int,

    booking_data: BookingUpdate,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Role check: only staff, manager, owner can update
    if current_account.role not in {"staff", "manager", "owner"}:
        raise HTTPException(
            status_code=403,
            detail="Staff, manager or owner access required"
        )

    if booking_data.status is not None:
        booking.status = booking_data.status

    if booking_data.notes is not None:
        booking.notes = booking_data.notes

    db.commit()
    db.refresh(booking)

    return booking_to_response(booking)


# =========================================================
# DELETE BOOKING — CANCEL
# =========================================================

@router.delete(
    "/{booking_id}",
    status_code=204
)
def cancel_booking(

    booking_id: int,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Role check: only staff, manager, owner can cancel
    if current_account.role not in {"staff", "manager", "owner"}:
        raise HTTPException(
            status_code=403,
            detail="Staff, manager or owner access required"
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled"
        )

    booking.status = "cancelled"

    db.commit()


# =========================================================
# GET REVIEW FOR BOOKING
# =========================================================

@router.get(
    "/{booking_id}/review",
    response_model=ReviewResponse
)
def get_booking_review(

    booking_id: int,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    booking = (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    review = (
        db.query(Review)
        .filter(Review.booking_id == booking_id)
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="No review found for this booking"
        )

    return review


# =========================================================
# CREATE REVIEW FOR BOOKING
# =========================================================

@router.post(
    "/{booking_id}/review",
    response_model=ReviewResponse,
    status_code=201
)
def create_booking_review(

    booking_id: int,

    review_data: ReviewCreate,

    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):

    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=422,
            detail="Rating must be between 1 and 5"
        )

    booking = (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id)
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # Review can only be submitted after checkout
    if booking.status != "checked_out":
        raise HTTPException(
            status_code=400,
            detail="Review can only be submitted after checkout"
        )

    # Prevent duplicate review for same booking
    existing_review = (
        db.query(Review)
        .filter(Review.booking_id == booking_id)
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=409,
            detail="Review already exists for this booking"
        )

    review = Review(
        booking_id=booking_id,
        rating=review_data.rating,
        review_text=review_data.review_text,
        reviewed_at=datetime.now(timezone.utc)
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review