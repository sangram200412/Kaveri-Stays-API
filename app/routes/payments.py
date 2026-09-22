from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth import get_current_account
from app.models.payment import Payment
from app.models.booking import Booking
from app.schemas.payment import PaymentCreate, PaymentResponse


router = APIRouter(
    tags=["Payments"]
)


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@router.get(
    "/payments/",
    response_model=list[PaymentResponse]
)
def get_all_payments(
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    payments = (
        db.query(Payment)
        .order_by(Payment.payment_id.desc())
        .limit(100)
        .all()
    )
    return payments


# ============================================================
# CREATE PAYMENT
# ============================================================

@router.post(
    "/bookings/{booking_id}/payments",
    response_model=PaymentResponse,
    status_code=201
)
def create_payment(
    booking_id: int,
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    # ========================================================
    # 1. CHECK BOOKING EXISTS
    # ========================================================

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

    # ========================================================
    # 2. VALIDATE PAYMENT METHOD
    # ========================================================

    allowed_methods = {
        "card",
        "upi",
        "bank_transfer",
        "cash"
    }

    if payment_data.method not in allowed_methods:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid payment method. "
                "Allowed values: card, upi, "
                "bank_transfer, cash"
            )
        )

    # ========================================================
    # 3. CHECK IDEMPOTENCY KEY
    # ========================================================

    existing_payment = (
        db.query(Payment)
        .filter(
            Payment.idempotency_key
            == payment_data.idempotency_key
        )
        .first()
    )

    if existing_payment is not None:
        # Same key + same booking
        if existing_payment.booking_id == booking_id:
            return existing_payment

        # Same key used for another booking
        raise HTTPException(
            status_code=409,
            detail="Idempotency key already used"
        )

    # ========================================================
    # 4. VALIDATE PAYMENT AMOUNT
    # ========================================================

    if payment_data.amount <= Decimal("0"):
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero"
        )

    # ========================================================
    # 5. CREATE PAYMENT
    # ========================================================

    payment = Payment(
        booking_id=booking_id,
        amount=payment_data.amount,
        method=payment_data.method,
        paid_at=datetime.now(timezone.utc),
        idempotency_key=payment_data.idempotency_key
    )

    db.add(payment)

    try:
        db.commit()
        db.refresh(payment)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Payment could not be created"
        )

    return payment


# ============================================================
# GET PAYMENTS FOR BOOKING
# ============================================================

@router.get(
    "/bookings/{booking_id}/payments",
    response_model=list[PaymentResponse]
)
def get_booking_payments(
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

    payments = (
        db.query(Payment)
        .filter(
            Payment.booking_id == booking_id
        )
        .order_by(
            Payment.payment_id.asc()
        )
        .all()
    )

    return payments