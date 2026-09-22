from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.property import Property
from app.schemas.property import (
    PropertyResponse,
    PropertyCreate
)
from app.auth import require_owner


router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


# ============================================================
# GET ALL PROPERTIES
# ============================================================

@router.get(
    "/",
    response_model=list[PropertyResponse]
)
def get_properties(
    db: Session = Depends(get_db)
):

    return (
        db.query(Property)
        .order_by(Property.property_id)
        .all()
    )


# ============================================================
# GET PROPERTY
# ============================================================

@router.get(
    "/{property_id}",
    response_model=PropertyResponse
)
def get_property(
    property_id: int,
    db: Session = Depends(get_db)
):

    property_obj = (
        db.query(Property)
        .filter(
            Property.property_id == property_id
        )
        .first()
    )

    if property_obj is None:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    return property_obj


# ============================================================
# CREATE PROPERTY — OWNER ONLY
# ============================================================

@router.post(
    "/",
    response_model=PropertyResponse,
    status_code=201
)
def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_account=Depends(require_owner)
):

    existing_property = (
        db.query(Property)
        .filter(
            Property.property_name ==
            property_data.property_name
        )
        .first()
    )

    if existing_property:
        raise HTTPException(
            status_code=409,
            detail="Property name already exists"
        )

    new_property = Property(
        property_name=property_data.property_name,
        city=property_data.city,
        star_rating=property_data.star_rating
    )

    db.add(new_property)

    try:
        db.commit()
        db.refresh(new_property)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Property name already exists"
        )

    return new_property