from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)