from datetime import datetime
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.models.reservation import Reservation
from app.schemas.payment import PaymentCreate


def create_payment(db: Session, payment: PaymentCreate):
    """
    Create a new payment record
    """
    reservation = (
        db.query(Reservation).filter(Reservation.id == payment.reservation_id).first()
    )

    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.booking_status == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation has been cancelled")

    # Determine if this is an advance payment or a remaining payment
    is_advance = False
    payment_type = payment.payment_type if payment.payment_type else "full"

    if payment_type == "advance":
        is_advance = True
        min_required = 0.05 * reservation.total_price

        if payment.amount < min_required:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum advance required is ₹{min_required:.2f}",
            )

        # Update reservation for advance payment
        reservation.booking_status = "confirmed"
        reservation.advance_paid = True
        reservation.advance_amount = payment.amount
        reservation.payment_status = "advance_paid"
        reservation.total_paid_amount = payment.amount
        reservation.remaining_amount = reservation.total_price - payment.amount

    elif payment_type == "remaining":
        # Check if advance is already paid
        if not reservation.advance_paid:
            raise HTTPException(
                status_code=400, detail="Advance payment must be completed first"
            )

        # Check if amount covers the remaining balance
        if payment.amount < reservation.remaining_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Payment amount ({payment.amount}) is less than remaining amount ({reservation.remaining_amount})",
            )

        # Update reservation for remaining payment
        reservation.is_fully_paid = True
        reservation.payment_status = "fully_paid"
        reservation.total_paid_amount += payment.amount
        reservation.remaining_amount = 0

    else:  # Full payment
        # Update reservation for full payment
        reservation.advance_paid = True
        reservation.is_fully_paid = True
        reservation.payment_status = "fully_paid"
        reservation.total_paid_amount = payment.amount
        reservation.remaining_amount = 0

    # Create payment record
    db_payment = Payment(
        reservation_id=payment.reservation_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        transaction_id=payment.transaction_id,
        payment_status="paid",
        payment_type=payment_type,
        is_advance=is_advance,
        payment_notes=payment.payment_notes,
        paid_at=datetime.utcnow(),
    )

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment


def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
    """
    Get a payment by ID
    """
    return db.query(Payment).filter(Payment.id == payment_id).first()


def get_payment_by_reservation(db: Session, reservation_id: int) -> Optional[Payment]:
    """
    Get a payment by reservation ID
    """
    return db.query(Payment).filter(Payment.reservation_id == reservation_id).first()


def get_all_payments_by_reservation(db: Session, reservation_id: int) -> List[Payment]:
    """
    Get all payments for a reservation
    """
    return db.query(Payment).filter(Payment.reservation_id == reservation_id).all()


def get_advance_payment(db: Session, reservation_id: int) -> Optional[Payment]:
    """
    Get the advance payment for a reservation
    """
    return (
        db.query(Payment)
        .filter(Payment.reservation_id == reservation_id, Payment.is_advance)
        .first()
    )


def get_remaining_payment(db: Session, reservation_id: int) -> Optional[Payment]:
    """
    Get the remaining payment for a reservation
    """
    return (
        db.query(Payment)
        .filter(
            Payment.reservation_id == reservation_id,
            ~Payment.is_advance,
            Payment.payment_type == "remaining",
        )
        .first()
    )


def calculate_total_paid(db: Session, reservation_id: int) -> float:
    """
    Calculate the total amount paid for a reservation
    """
    payments = get_all_payments_by_reservation(db, reservation_id)
    return sum(payment.amount for payment in payments)
