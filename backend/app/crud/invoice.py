from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.invoice import Invoice
from app.models.reservation import Reservation


def create_invoice(db: Session, reservation_id: int, pdf_path: str, invoice_type: str):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Check if invoice of the same type already exists
    existing_invoice = (
        db.query(Invoice)
        .filter(
            Invoice.reservation_id == reservation_id,
            Invoice.invoice_type == invoice_type,
        )
        .first()
    )

    if existing_invoice:
        raise HTTPException(
            status_code=400, detail=f"{invoice_type.title()} invoice already exists"
        )

    db_invoice = Invoice(
        reservation_id=reservation_id,
        pdf_path=pdf_path,
        invoice_type=invoice_type,
        generated_at=datetime.utcnow(),
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def get_invoice_by_reservation(db: Session, reservation_id: int):
    return db.query(Invoice).filter(Invoice.reservation_id == reservation_id).all()
