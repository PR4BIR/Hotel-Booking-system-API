from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=False)
    pdf_path = Column(String(255), nullable=False)
    invoice_type = Column(String(50), default="final")  # 'advance' or 'final'
    generated_at = Column(DateTime, default=datetime.utcnow)

    reservation = relationship("Reservation", back_populates="invoice")
