from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(20), default="paid")  # paid, failed, refunded
    transaction_id = Column(String(100), nullable=True)
    payment_type = Column(String(20), default="full")  # advance, remaining, full
    payment_notes = Column(String(255), nullable=True)  # Any additional notes
    is_advance = Column(Boolean, default=False)  # Flag for advance payments
    paid_at = Column(DateTime, default=datetime.utcnow)

    reservation = relationship("Reservation", back_populates="payments")
