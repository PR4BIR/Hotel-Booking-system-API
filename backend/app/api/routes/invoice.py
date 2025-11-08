from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.invoice import Invoice
from app.models.user import User
from app.models.reservation import Reservation
from app.schemas.invoice import InvoiceOut
from typing import List
import os

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("/", response_model=List[InvoiceOut])
def list_invoices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return db.query(Invoice).all()
    return db.query(Invoice).join(Reservation).filter(Reservation.user_id == current_user.id).all()

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if current_user.role != "admin" and invoice.reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this invoice")

    return invoice

@router.get("/{invoice_id}/download")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice or not os.path.exists(invoice.pdf_path):
        raise HTTPException(status_code=404, detail="Invoice PDF not found")

    if current_user.role != "admin" and invoice.reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to download this invoice")

    return {
        "filename": os.path.basename(invoice.pdf_path),
        "filepath": invoice.pdf_path
    }
