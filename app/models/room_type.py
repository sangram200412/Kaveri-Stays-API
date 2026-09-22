from sqlalchemy import Integer, String, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class RoomType(Base):
    __tablename__ = "room_types"

    room_type_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    type_name: Mapped[str] = mapped_column(
        "name",
        String(50),
        nullable=False
    )

    max_occupancy: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False
    )