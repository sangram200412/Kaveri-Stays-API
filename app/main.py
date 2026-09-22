from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import get_db

from app.routes.properties import router as properties_router
from app.routes.room_types import router as room_types_router
from app.routes.room import router as rooms_router
from app.routes.guests import router as guests_router
from app.routes.booking import router as bookings_router
from app.routes.reports import router as reports_router
from app.routes.me import router as me_router
from app.routes.auth import router as auth_router
from app.routes.payments import router as payments_router
from app.routes.reviews import router as reviews_router


app = FastAPI(
    title="Kaveri Stays API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)

app.include_router(me_router)

app.include_router(properties_router)

app.include_router(room_types_router)

app.include_router(rooms_router)

app.include_router(guests_router)

app.include_router(bookings_router)

app.include_router(payments_router)

app.include_router(reviews_router)

app.include_router(reports_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Kaveri Stays API is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check(
    db: Session = Depends(get_db)
):

    result = db.execute(
        text("SELECT 1")
    )

    return {
        "status": "ok",
        "database": result.scalar()
    }