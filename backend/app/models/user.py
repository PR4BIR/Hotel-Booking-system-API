from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)  # Add this field
    email = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    role = Column(String(20), default="user")  # Change default from "guest" to "user"
    created_at = Column(DateTime, default=datetime.utcnow)
    is_verified = Column(Boolean, default=True)  # Set to True for quick testing
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    reservations = relationship("Reservation", back_populates="user")
    feedbacks = relationship("Feedback", back_populates="user")