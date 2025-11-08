from datetime import date, datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.room import Room
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/payment-reports")
def get_payment_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    payment_status: Optional[str] = Query(
        None, description="Filter by payment status (pending, advance_paid, fully_paid)"
    ),
    check_out_date: Optional[date] = Query(
        None, description="Filter by check-out date"
    ),
    skip: int = 0,
    limit: int = 100,
):
    """
    Get detailed payment reports for admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admin can access payment reports"
        )

    # Use full_name instead of name
    query = (
        db.query(
            Reservation,
            User.full_name.label("user_name"),
            User.email.label("user_email"),
            Room.room_number.label("room_number"),
            Room.room_type.label("room_type"),
        )
        .join(User, Reservation.user_id == User.id)
        .join(Room, Reservation.room_id == Room.id)
    )

    # Apply filters
    if payment_status:
        query = query.filter(Reservation.payment_status == payment_status)

    if check_out_date:
        query = query.filter(Reservation.check_out_date == check_out_date)

    # Pagination
    results = query.offset(skip).limit(limit).all()

    # Process results into a report format
    report_data = []
    for result in results:
        reservation = result[0]  # The Reservation object

        # Get all payments for this reservation
        payments = (
            db.query(Payment).filter(Payment.reservation_id == reservation.id).all()
        )

        # Calculate days until checkout
        days_until_checkout = None
        if reservation.check_out_date and not reservation.is_checked_out:
            days_until_checkout = (
                reservation.check_out_date - datetime.now().date()
            ).days

        report_data.append(
            {
                "reservation_id": reservation.id,
                "user_name": result.user_name,
                "user_email": result.user_email,
                "room_number": result.room_number,
                "room_type": result.room_type,
                "check_in_date": reservation.check_in_date,
                "check_out_date": reservation.check_out_date,
                "total_price": reservation.total_price,
                "advance_amount": reservation.advance_amount,
                "remaining_amount": reservation.remaining_amount,
                "payment_status": reservation.payment_status,
                "is_checked_in": reservation.is_checked_in,
                "is_checked_out": reservation.is_checked_out,
                "is_no_show": reservation.is_no_show,
                "days_until_checkout": days_until_checkout,
                "payments": [
                    {
                        "id": payment.id,
                        "amount": payment.amount,
                        "payment_method": payment.payment_method,
                        "payment_type": payment.payment_type
                        if hasattr(payment, "payment_type")
                        else "unknown",
                        "paid_at": payment.paid_at,
                    }
                    for payment in payments
                ],
            }
        )

    return report_data


@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get admin dashboard statistics
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can access dashboard")

    today = datetime.now().date()

    # Count reservations by status
    total_reservations = db.query(func.count(Reservation.id)).scalar()
    pending_payments = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.payment_status == "pending")
        .scalar()
    )
    advance_paid = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.payment_status == "advance_paid")
        .scalar()
    )
    fully_paid = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.payment_status == "fully_paid")
        .scalar()
    )

    # Get today's check-ins and check-outs
    todays_checkins = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.check_in_date == today,
            Reservation.booking_status == "confirmed",
        )
        .scalar()
    )

    todays_checkouts = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.check_out_date == today,
            Reservation.is_checked_in,
            ~Reservation.is_checked_out,
        )
        .scalar()
    )

    # Get upcoming no-shows (reservations from yesterday that didn't check in)
    yesterday = today - timedelta(days=1)
    potential_no_shows = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.check_in_date == yesterday,
            ~Reservation.is_checked_in,
            Reservation.booking_status == "confirmed",
            ~Reservation.is_no_show,
        )
        .scalar()
    )

    # Room availability
    total_rooms = db.query(func.count(Room.id)).scalar()
    available_rooms = db.query(func.count(Room.id)).filter(Room.is_available).scalar()

    # Revenue statistics
    total_revenue = db.query(func.sum(Payment.amount)).scalar() or 0
    advance_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(
            Payment.payment_type == "advance"
            if hasattr(Payment, "payment_type")
            else False
        )
        .scalar()
        or 0
    )

    # Outstanding payments (remaining amount for advance_paid reservations)
    outstanding_payments = (
        db.query(func.sum(Reservation.remaining_amount))
        .filter(Reservation.payment_status == "advance_paid")
        .scalar()
        or 0
    )

    return {
        "reservation_stats": {
            "total_reservations": total_reservations,
            "pending_payments": pending_payments,
            "advance_paid": advance_paid,
            "fully_paid": fully_paid,
        },
        "today_activity": {
            "check_ins": todays_checkins,
            "check_outs": todays_checkouts,
            "potential_no_shows": potential_no_shows,
        },
        "room_stats": {
            "total_rooms": total_rooms,
            "available_rooms": available_rooms,
            "occupancy_rate": (total_rooms - available_rooms) / total_rooms
            if total_rooms > 0
            else 0,
        },
        "financial_stats": {
            "total_revenue": total_revenue,
            "advance_payments": advance_revenue,
            "outstanding_payments": outstanding_payments,
        },
    }


@router.get("/upcoming-checkouts")
def get_upcoming_checkouts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = Query(7, description="Number of days to look ahead"),
):
    """
    Get list of upcoming checkouts for the next X days
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admin can access this endpoint"
        )

    today = datetime.now().date()
    end_date = today + timedelta(days=days)

    query = (
        db.query(
            Reservation,
            User.full_name.label("user_name"),
            Room.room_number.label("room_number"),
        )
        .join(User, Reservation.user_id == User.id)
        .join(Room, Reservation.room_id == Room.id)
        .filter(
            Reservation.check_out_date >= today,
            Reservation.check_out_date <= end_date,
            Reservation.is_checked_in,
            ~Reservation.is_checked_out,
        )
        .order_by(Reservation.check_out_date)
    )

    results = query.all()

    checkout_data = []
    for result in results:
        reservation = result[0]

        checkout_data.append(
            {
                "reservation_id": reservation.id,
                "user_name": result.user_name,
                "room_number": result.room_number,
                "check_out_date": reservation.check_out_date,
                "is_fully_paid": reservation.is_fully_paid,
                "remaining_amount": reservation.remaining_amount,
                "days_until_checkout": (reservation.check_out_date - today).days,
            }
        )

    return checkout_data


@router.get("/payment-pending")
def get_payment_pending(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get all reservations with pending payments
    (both completely unpaid and partially paid)
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403, detail="Only admin can access this endpoint"
        )

    query = (
        db.query(
            Reservation,
            User.full_name.label("user_name"),
            User.email.label("user_email"),
            Room.room_number.label("room_number"),
        )
        .join(User, Reservation.user_id == User.id)
        .join(Room, Reservation.room_id == Room.id)
        .filter(
            Reservation.payment_status.in_(["pending", "advance_paid"]),
            Reservation.booking_status != "cancelled",
        )
        .order_by(Reservation.check_in_date)
    )

    results = query.all()

    pending_data = []
    for result in results:
        reservation = result[0]

        pending_data.append(
            {
                "reservation_id": reservation.id,
                "user_name": result.user_name,
                "user_email": result.user_email,
                "room_number": result.room_number,
                "check_in_date": reservation.check_in_date,
                "check_out_date": reservation.check_out_date,
                "total_price": reservation.total_price,
                "payment_status": reservation.payment_status,
                "advance_amount": reservation.advance_amount,
                "remaining_amount": reservation.remaining_amount,
                "is_checked_in": reservation.is_checked_in,
            }
        )

    return pending_data
