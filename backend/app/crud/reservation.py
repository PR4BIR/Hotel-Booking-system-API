from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.models.room import Room
from app.models.user import User
from app.schemas.reservation import ReservationCreate


def is_room_available(db: Session, room_id: int, check_in, check_out):
    """
    Check if a room is available for booking
    - Room must not be booked for any dates within the requested period
    - Properly handle checkout date (room is available on checkout date)
    """
    overlapping = (
        db.query(Reservation)
        .filter(
            Reservation.room_id == room_id,
            Reservation.booking_status != "cancelled",
            not Reservation.is_no_show,
            and_(
                Reservation.check_in_date < check_out,
                Reservation.check_out_date > check_in,
            ),
        )
        .first()
    )
    return overlapping is None


def calculate_nights(check_in, check_out):
    return (check_out - check_in).days


def calculate_total_price(price_per_night: float, nights: int):
    return price_per_night * nights


def create_reservation(db: Session, reservation: ReservationCreate, user_id: int):
    room = db.query(Room).filter(Room.id == reservation.room_id).first()
    if not room or not room.is_available:
        raise HTTPException(status_code=404, detail="Room not available")

    if not is_room_available(
        db, reservation.room_id, reservation.check_in_date, reservation.check_out_date
    ):
        raise HTTPException(
            status_code=409, detail="Room is already booked for the selected dates"
        )

    nights = calculate_nights(reservation.check_in_date, reservation.check_out_date)
    total_price = calculate_total_price(room.price_per_night, nights)

    db_reservation = Reservation(
        user_id=user_id,
        room_id=reservation.room_id,
        check_in_date=reservation.check_in_date,
        check_out_date=reservation.check_out_date,
        total_nights=nights,
        total_price=total_price,
        booking_status="pending",  # Advance payment needed
        payment_status="pending",  # Pending payment
        advance_paid=False,
        advance_amount=0,
        remaining_amount=total_price,
        total_paid_amount=0,
        is_fully_paid=False,
        created_at=datetime.utcnow(),
    )
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    return db_reservation


def get_reservation_by_id(db: Session, reservation_id: int):
    return db.query(Reservation).filter(Reservation.id == reservation_id).first()


def get_user_reservations(db: Session, user_id: int):
    return db.query(Reservation).filter(Reservation.user_id == user_id).all()


def cancel_reservation(db: Session, reservation_id: int):
    reservation = get_reservation_by_id(db, reservation_id)
    if reservation and reservation.booking_status != "cancelled":
        reservation.booking_status = "cancelled"
        db.commit()
        db.refresh(reservation)
    return reservation


def update_payment_status(db: Session, reservation_id: int, payment_data: dict):
    """
    Update the payment status of a reservation
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    for key, value in payment_data.items():
        setattr(reservation, key, value)

    db.commit()
    db.refresh(reservation)
    return reservation


def process_advance_payment(db: Session, reservation_id: int, amount: float):
    """
    Process advance payment for a reservation
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Calculate 5% of total price
    min_advance = reservation.total_price * 0.05

    if amount < min_advance:
        raise HTTPException(
            status_code=400, detail=f"Advance payment must be at least {min_advance}"
        )

    # Update reservation
    reservation.advance_paid = True
    reservation.advance_amount = amount
    reservation.total_paid_amount = amount
    reservation.remaining_amount = reservation.total_price - amount
    reservation.payment_status = "advance_paid"
    reservation.booking_status = "confirmed"  # Confirm booking after advance payment

    db.commit()
    db.refresh(reservation)
    return reservation


def process_remaining_payment(db: Session, reservation_id: int, amount: float):
    """
    Process remaining payment for a reservation
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if not reservation.advance_paid:
        raise HTTPException(
            status_code=400, detail="Advance payment must be completed first"
        )

    if amount < reservation.remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Payment amount ({amount}) is less than remaining amount ({reservation.remaining_amount})",
        )

    # Update reservation
    reservation.total_paid_amount += amount
    reservation.remaining_amount = 0
    reservation.payment_status = "fully_paid"
    reservation.is_fully_paid = True

    db.commit()
    db.refresh(reservation)
    return reservation


def check_in_user(db: Session, reservation_id: int):
    """
    Mark a reservation as checked in
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if not reservation.advance_paid:
        raise HTTPException(
            status_code=400, detail="Advance payment is required before check-in"
        )

    reservation.is_checked_in = True
    reservation.check_in_status = "arrived"
    reservation.check_in_date_time = datetime.utcnow()

    db.commit()
    db.refresh(reservation)
    return reservation


def check_out_user(db: Session, reservation_id: int):
    """
    Mark a reservation as checked out
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if not reservation.is_checked_in:
        raise HTTPException(
            status_code=400, detail="User must be checked in before checkout"
        )

    if not reservation.is_fully_paid:
        raise HTTPException(
            status_code=400, detail="Full payment is required before checkout"
        )

    reservation.is_checked_out = True
    reservation.check_out_date_time = datetime.utcnow()

    db.commit()
    db.refresh(reservation)
    return reservation


def mark_as_no_show(db: Session, reservation_id: int):
    """
    Mark a reservation as no-show
    """
    reservation = get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.is_checked_in:
        raise HTTPException(status_code=400, detail="User has already checked in")

    reservation.is_no_show = True
    reservation.check_in_status = "no-show"

    db.commit()
    db.refresh(reservation)
    return reservation


def get_no_shows(db: Session, check_date: date):
    """
    Get reservations that are potential no-shows
    """
    yesterday = check_date - timedelta(days=1)
    return (
        db.query(Reservation)
        .filter(
            Reservation.check_in_date == yesterday,
            not Reservation.is_checked_in,
            Reservation.booking_status == "confirmed",
            not Reservation.is_no_show,
        )
        .all()
    )


def get_reservations_by_payment_status(
    db: Session, payment_status: str, skip: int = 0, limit: int = 100
):
    """
    Get reservations by payment status
    """
    return (
        db.query(Reservation)
        .filter(Reservation.payment_status == payment_status)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_reservations_by_checkout_date(
    db: Session, checkout_date: date, skip: int = 0, limit: int = 100
):
    """
    Get reservations by checkout date
    """
    return (
        db.query(Reservation)
        .filter(Reservation.check_out_date == checkout_date)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_reservations_with_details(
    db: Session,
    payment_status: Optional[str] = None,
    checkout_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
):
    """
    Get reservations with filtering options for admin reports
    """
    query = (
        db.query(
            Reservation,
            User.name.label("user_name"),
            User.email.label("user_email"),
            Room.room_number.label("room_number"),
            Room.room_type.label("room_type"),
        )
        .join(User, Reservation.user_id == User.id)
        .join(Room, Reservation.room_id == Room.id)
    )

    if payment_status:
        query = query.filter(Reservation.payment_status == payment_status)

    if checkout_date:
        query = query.filter(Reservation.check_out_date == checkout_date)

    return query.offset(skip).limit(limit).all()
