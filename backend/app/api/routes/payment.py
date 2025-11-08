from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.email_utils import send_admin_payment_alert
from app.services.invoice import generate_invoice_pdf_and_email

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = (
        db.query(Reservation).filter(Reservation.id == payment.reservation_id).first()
    )

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Not authorized to pay for this reservation"
        )

    if reservation.booking_status == "cancelled":
        raise HTTPException(
            status_code=400, detail="Cannot pay for a cancelled reservation"
        )

    remaining_amount = reservation.total_price - reservation.total_paid_amount
    if payment.amount > remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Payment exceeds remaining amount. Only ₹{remaining_amount:.2f} is due.",
        )

    # Create the payment record
    db_payment = Payment(
        reservation_id=payment.reservation_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_status="paid",
        transaction_id=payment.transaction_id,
        paid_at=datetime.utcnow(),
    )
    db.add(db_payment)

    # Update reservation status
    reservation.total_paid_amount += payment.amount

    # Case 1: Fully Paid
    if reservation.total_paid_amount >= reservation.total_price:
        reservation.is_fully_paid = True
        reservation.advance_paid = True
        reservation.booking_status = "confirmed"
        if reservation.room:
            reservation.room.is_available = False

        db.commit()
        db.refresh(reservation)

        send_admin_payment_alert(reservation, db_payment)
        generate_invoice_pdf_and_email(
            db=db, reservation=reservation, invoice_type="final"
        )

    # Case 2: Advance Paid but not fully
    elif not reservation.advance_paid and payment.amount >= reservation.advance_amount:
        reservation.advance_paid = True
        db.commit()
        generate_invoice_pdf_and_email(
            db=db, reservation=reservation, invoice_type="advance"
        )

    else:
        db.commit()

    db.refresh(db_payment)
    return db_payment


@router.get("/", response_model=List[PaymentOut])
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        return db.query(Payment).all()

    return (
        db.query(Payment)
        .join(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .all()
    )


@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment_by_id(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if current_user.role != "admin" and payment.reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this payment"
        )

    return payment
