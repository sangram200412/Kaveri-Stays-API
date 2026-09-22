from sqlalchemy import Integer, String, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Property(Base):
    __tablename__ = "properties"

    property_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    property_name: Mapped[str] = mapped_column(
        "name",
        String(100),
        nullable=False
    )

    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    star_rating: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False
    )