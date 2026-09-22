from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Room(Base):
    __tablename__ = "rooms"

    room_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    property_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("properties.property_id"),
        nullable=False
    )

    room_number: Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    room_type_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("room_types.room_type_id"),
        nullable=False
    )