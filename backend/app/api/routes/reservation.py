from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.reservation import Reservation
from app.models.room import Room
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.schemas.reservation import ReservationCreate, ReservationOut
from app.services.payment_service import (
    check_for_no_shows,
    process_advance_payment,
    process_remaining_payment,
)

router = APIRouter(prefix="/reservations", tags=["Reservations"])

# Shared function to avoid code duplication
def _get_reservations_logic(
    db: Session,
    current_user: User,
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    room_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
):
    print(f"🔍 User {current_user.email} (Role: {current_user.role}) accessing reservations")
    
    query = db.query(Reservation)

    if current_user.role != "admin":
        query = query.filter(Reservation.user_id == current_user.id)

    if status:
        query = query.filter(Reservation.booking_status == status)
    if payment_status:
        query = query.filter(Reservation.payment_status == payment_status)
    if room_id:
        query = query.filter(Reservation.room_id == room_id)
    if from_date:
        query = query.filter(Reservation.check_in_date >= from_date)
    if to_date:
        query = query.filter(Reservation.check_in_date <= to_date)

    reservations = query.all()
    print(f"📊 Returning {len(reservations)} reservations")
    return reservations

# Handle both with and without trailing slash to prevent redirect issues
@router.get("", response_model=List[ReservationOut])
def list_reservations_no_slash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    room_id: Optional[int] = Query(None, description="Filter by room ID"),
    from_date: Optional[date] = Query(None, description="Filter check-in date from"),
    to_date: Optional[date] = Query(None, description="Filter check-in date to"),
):
    return _get_reservations_logic(db, current_user, status, payment_status, room_id, from_date, to_date)

@router.get("/", response_model=List[ReservationOut])
def list_reservations_with_slash(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    room_id: Optional[int] = Query(None, description="Filter by room ID"),
    from_date: Optional[date] = Query(None, description="Filter check-in date from"),
    to_date: Optional[date] = Query(None, description="Filter check-in date to"),
):
    return _get_reservations_logic(db, current_user, status, payment_status, room_id, from_date, to_date)

@router.post("/", response_model=ReservationOut)
def create_reservation(
    reservation: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == reservation.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if not room.is_available:
        raise HTTPException(status_code=400, detail="Room is not available")

    overlapping = (
        db.query(Reservation)
        .filter(
            Reservation.room_id == reservation.room_id,
            Reservation.check_out_date > reservation.check_in_date,
            Reservation.check_in_date < reservation.check_out_date,
            Reservation.booking_status != "cancelled",
            ~Reservation.is_no_show,  # Use SQLAlchemy negation for boolean
        )
        .first()
    )
    if overlapping:
        raise HTTPException(
            status_code=409, detail="Room already booked for selected dates"
        )

    nights = (reservation.check_out_date - reservation.check_in_date).days
    total_price = nights * room.price_per_night
    advance_amount = round(0.05 * total_price, 2)
    remaining_amount = total_price - advance_amount

    db_reservation = Reservation(
        user_id=current_user.id,
        room_id=reservation.room_id,
        check_in_date=reservation.check_in_date,
        check_out_date=reservation.check_out_date,
        total_nights=nights,
        total_price=total_price,
        advance_amount=advance_amount,
        remaining_amount=remaining_amount,
        advance_paid=False,
        check_in_status="pending",
        booking_status="pending",
        payment_status="pending",
        is_checked_in=False,
        is_checked_out=False,
        is_no_show=False,
    )

    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)

    return db_reservation

@router.post("/{reservation_id}/advance-payment", response_model=PaymentResponse)
async def make_advance_payment(
    reservation_id: int,
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Make advance payment (5% of total) for a reservation
    """
    # Check if reservation exists and belongs to user
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation or (
        current_user.role != "admin" and reservation.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Check if reservation is in valid state for payment
    if reservation.booking_status == "cancelled":
        raise HTTPException(
            status_code=400, detail="Cannot pay for a cancelled reservation"
        )

    if reservation.advance_paid:
        raise HTTPException(status_code=400, detail="Advance payment already made")

    # Process advance payment
    payment_data = {
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "transaction_id": payment.transaction_id,
    }

    result = await process_advance_payment(db, reservation_id, payment_data)

    # Room is now confirmed, update room availability
    room = db.query(Room).filter(Room.id == reservation.room_id).first()
    if room:
        room.is_available = False
        db.commit()

    return result

@router.post("/{reservation_id}/remaining-payment", response_model=PaymentResponse)
async def make_remaining_payment(
    reservation_id: int,
    payment: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Make remaining payment for a reservation
    """
    # Check if reservation exists and belongs to user
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation or (
        current_user.role != "admin" and reservation.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Check if reservation is in valid state for payment
    if reservation.booking_status == "cancelled":
        raise HTTPException(
            status_code=400, detail="Cannot pay for a cancelled reservation"
        )

    if not reservation.advance_paid:
        raise HTTPException(
            status_code=400, detail="Advance payment must be made first"
        )

    if reservation.is_fully_paid:
        raise HTTPException(status_code=400, detail="Reservation is already fully paid")

    # Process remaining payment
    payment_data = {
        "amount": payment.amount,
        "payment_method": payment.payment_method,
        "transaction_id": payment.transaction_id,
    }

    result = await process_remaining_payment(db, reservation_id, payment_data)
    return result

@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if current_user.role != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this reservation"
        )
    return reservation

@router.post("/mark-no-shows")
async def handle_no_shows(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can mark no-shows")

    # Use our new function to check for no-shows
    updated = await check_for_no_shows(db)

    # Free up rooms for no-show reservations
    no_show_reservations = (
        db.query(Reservation)
        .filter(Reservation.is_no_show, Reservation.room_id.isnot(None))
        .all()
    )

    for reservation in no_show_reservations:
        room = db.query(Room).filter(Room.id == reservation.room_id).first()
        if room:
            room.is_available = True

    db.commit()

    return {"updated_reservations": updated}

@router.post("/{reservation_id}/check-in")
def check_in_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can check in guests")

    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if reservation.is_checked_in:
        raise HTTPException(status_code=400, detail="Guest already checked in")

    if reservation.booking_status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking not confirmed")

    if not reservation.advance_paid:
        raise HTTPException(
            status_code=400, detail="Advance payment required before check-in"
        )

    # Update reservation
    reservation.is_checked_in = True
    reservation.check_in_status = "arrived"
    reservation.check_in_date_time = datetime.now()
    db.commit()
    db.refresh(reservation)

    return {
        "message": "Guest successfully checked in",
        "reservation_id": reservation_id,
    }

@router.post("/{reservation_id}/check-out")
def check_out_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can check out guests")
        
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if not reservation.is_checked_in:
        raise HTTPException(status_code=400, detail="Guest hasn't checked in yet")

    if reservation.is_checked_out:
        raise HTTPException(status_code=400, detail="Guest already checked out")

    if not reservation.is_fully_paid:
        raise HTTPException(
            status_code=400, detail="Full payment required before check-out"
        )

    # Update reservation
    reservation.is_checked_out = True
    reservation.check_out_date_time = datetime.now()

    # Make room available again after check-out
    if reservation.room:
        reservation.room.is_available = True
        
    db.commit()
    db.refresh(reservation)

    return {
        "message": "Guest successfully checked out",
        "reservation_id": reservation_id,
    }

@router.post("/{reservation_id}/cancel")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Guest can only cancel their own reservation
    if current_user.role != "admin" and reservation.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to cancel this reservation"
        )

    if reservation.booking_status == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation already cancelled")
        
    if reservation.check_in_status == "no-show":
        raise HTTPException(
            status_code=400, detail="Cannot cancel a no-show reservation"
        )

    if reservation.is_checked_in:
        raise HTTPException(status_code=400, detail="Cannot cancel after check-in")

    # Properly cancel the reservation
    reservation.booking_status = "cancelled"
    reservation.payment_status = "cancelled"
    
    # Make room available again
    if reservation.room:
        reservation.room.is_available = True
    
    db.commit()
    db.refresh(reservation)

    return {
        "message": "Reservation cancelled successfully",
        "reservation_id": reservation.id,
        "status": reservation.booking_status,
    }