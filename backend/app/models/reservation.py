from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    check_out_date = Column(Date, nullable=False)
    total_nights = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)

    # Payment status tracking
    advance_paid = Column(Boolean, default=False)
    advance_amount = Column(Float, default=0.0)
    remaining_amount = Column(Float, default=0.0)  # New field to track remaining amount
    payment_status = Column(
        String(50), default="pending"
    )  # pending, advance_paid, fully_paid
    total_paid_amount = Column(Float, default=0.0)  # Track total payment
    is_fully_paid = Column(Boolean, default=False)

    # Check-in/out status tracking
    check_in_status = Column(String(50), default="pending")  # pending, arrived, no-show
    booking_status = Column(String(50), default="pending")  # confirmed, cancelled
    is_checked_in = Column(Boolean, default=False)  # New field
    is_checked_out = Column(Boolean, default=False)  # New field
    is_no_show = Column(Boolean, default=False)  # New field to track no-shows
    check_in_date_time = Column(DateTime, nullable=True)  # Actual check-in time
    check_out_date_time = Column(DateTime, nullable=True)  # Actual check-out time

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")
    payments = relationship(
        "Payment", back_populates="reservation", cascade="all, delete-orphan"
    )
    invoice = relationship("Invoice", back_populates="reservation", uselist=False)
