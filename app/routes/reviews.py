from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.review import Review
from app.models.booking import Booking
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse
)


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# ============================================================
# CREATE REVIEW
# ============================================================

@router.post(
    "/",
    response_model=ReviewResponse,
    status_code=201
)
def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check booking exists
    # --------------------------------------------------------

    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == review_data.booking_id
        )
        .first()
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # Review should be submitted after checkout
    # --------------------------------------------------------

    if booking.status != "checked_out":
        raise HTTPException(
            status_code=400,
            detail="Review can only be submitted after checkout"
        )

    # --------------------------------------------------------
    # Prevent duplicate review for same booking
    # --------------------------------------------------------

    existing_review = (
        db.query(Review)
        .filter(
            Review.booking_id == review_data.booking_id
        )
        .first()
    )

    if existing_review:
        raise HTTPException(
            status_code=409,
            detail="Review already exists for this booking"
        )

    # --------------------------------------------------------
    # Create review
    # --------------------------------------------------------

    review = Review(
        booking_id=review_data.booking_id,
        rating=review_data.rating,
        review_text=review_data.review_text,
        reviewed_at=datetime.now(timezone.utc)
    )

    db.add(review)

    try:
        db.commit()
        db.refresh(review)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Unable to create review"
        )

    return review


# ============================================================
# GET ALL REVIEWS
# ============================================================

@router.get(
    "/",
    response_model=list[ReviewResponse]
)
def get_reviews(
    db: Session = Depends(get_db)
):

    reviews = (
        db.query(Review)
        .order_by(Review.review_id)
        .all()
    )

    return reviews


# ============================================================
# GET REVIEW BY ID
# ============================================================

@router.get(
    "/{review_id}",
    response_model=ReviewResponse
)
def get_review(
    review_id: int,
    db: Session = Depends(get_db)
):

    review = (
        db.query(Review)
        .filter(
            Review.review_id == review_id
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=404,
            detail="Review not found"
        )

    return review