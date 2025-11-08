import os
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import crud
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.schemas.payment import PaymentCreate
from app.services.email_utils import (
    send_admin_payment_alert,
    send_payment_confirmation_email,
)


async def process_advance_payment(
    db: Session, reservation_id: int, payment_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process advance payment (5% of total amount) for a reservation
    """
    # Get reservation
    reservation = crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Calculate minimum advance amount (5% of total)
    min_advance = reservation.total_price * 0.05

    # Validate payment amount
    if payment_data["amount"] < min_advance:
        raise HTTPException(
            status_code=400,
            detail=f"Advance payment must be at least {min_advance:.2f}",
        )

    # Create payment record
    payment_create = PaymentCreate(
        reservation_id=reservation_id,
        amount=payment_data["amount"],
        payment_method=payment_data["payment_method"],
        transaction_id=payment_data.get("transaction_id"),
        payment_type="advance",
        payment_notes="Advance payment (5%)",
    )

    # Create payment
    payment = crud.create_payment(db, payment_create)

    # Generate invoice
    invoice = await generate_invoice(db, reservation_id, payment.id, "advance")

    # Send confirmation email
    user = crud.get_user_by_id(db, reservation.user_id)
    if user:
        send_payment_confirmation_email(
            user.email,
            "Advance Payment Confirmation",
            f"""
            Your advance payment of {payment.amount:.2f} has been received.
            Your room is now confirmed for {reservation.check_in_date} to {reservation.check_out_date}.
            Remaining amount: {reservation.remaining_amount:.2f}
            
            Thank you for choosing our hotel!
            """,
        )

    return {
        "payment": payment,
        "invoice_id": invoice.id if invoice else None,
        "reservation_status": reservation.booking_status,
        "payment_status": reservation.payment_status,
        "remaining_amount": reservation.remaining_amount,
    }


async def process_remaining_payment(
    db: Session, reservation_id: int, payment_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process remaining payment for a reservation
    """
    # Get reservation
    reservation = crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Validate reservation status
    if not reservation.advance_paid:
        raise HTTPException(
            status_code=400, detail="Advance payment must be completed first"
        )

    # Validate payment amount
    if payment_data["amount"] < reservation.remaining_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Remaining amount is {reservation.remaining_amount:.2f}",
        )

    # Create payment record
    payment_create = PaymentCreate(
        reservation_id=reservation_id,
        amount=payment_data["amount"],
        payment_method=payment_data["payment_method"],
        transaction_id=payment_data.get("transaction_id"),
        payment_type="remaining",
        payment_notes="Remaining payment",
    )

    # Create payment
    payment = crud.create_payment(db, payment_create)

    # Generate invoice
    invoice = await generate_invoice(db, reservation_id, payment.id, "full")

    # Send confirmation email
    user = crud.get_user_by_id(db, reservation.user_id)
    if user:
        send_payment_confirmation_email(
            user.email,
            "Full Payment Confirmation",
            f"""
            Your full payment of {reservation.total_price:.2f} has been received.
            Your reservation is now fully paid.
            
            Check-in: {reservation.check_in_date}
            Check-out: {reservation.check_out_date}
            
            Thank you for choosing our hotel!
            """,
        )

        # Also send admin notification
        send_admin_payment_alert(reservation, payment)

    return {
        "payment": payment,
        "invoice_id": invoice.id if invoice else None,
        "reservation_status": reservation.booking_status,
        "payment_status": reservation.payment_status,
        "remaining_amount": 0,
    }


async def generate_invoice(
    db: Session, reservation_id: int, payment_id: int, invoice_type: str
) -> Optional[Any]:
    """
    Generate an invoice for a payment
    """
    # Get reservation details
    reservation = crud.get_reservation_by_id(db, reservation_id)
    if not reservation:
        return None

    # Get user details
    user = crud.get_user_by_id(db, reservation.user_id)
    if not user:
        return None

    # Get room details
    room = crud.get_room_by_id(db, reservation.room_id)
    if not room:
        return None

    # Get payment details
    payment = crud.get_payment_by_id(db, payment_id)
    if not payment:
        return None

    # Prepare invoice data
    invoice_data = {
        "reservation_id": reservation_id,
        "invoice_date": datetime.utcnow(),
        "invoice_type": invoice_type,
        "total_amount": payment.amount,
        "pdf_path": None,  # Will be set after PDF generation
    }

    # Create invoice record
    invoice = await crud.create_invoice(db, invoice_data)

    # Generate PDF
    pdf_path = await generate_invoice_pdf(
        invoice.id, user, room, reservation, payment, invoice_type
    )

    # Update invoice with PDF path (ensure path is absolute and accessible)
    if pdf_path:
        abs_pdf_path = os.path.abspath(pdf_path)
        invoice = await crud.update_invoice(db, invoice.id, {"pdf_path": abs_pdf_path})

    return invoice


async def generate_invoice_pdf(
    invoice_id: int,
    user: Any,
    room: Any,
    reservation: Reservation,
    payment: Payment,
    invoice_type: str,
) -> Optional[str]:
    """
    Generate a PDF invoice
    """
    try:
        import os

        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        # Create directory if it doesn't exist
        os.makedirs("invoices", exist_ok=True)

        # Generate PDF filename
        filename = f"invoices/invoice_{invoice_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        abs_filename = os.path.abspath(filename)

        # Create PDF
        c = canvas.Canvas(abs_filename, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, f"Hotel Invoice - {invoice_type.title()}")

        c.setFont("Helvetica", 12)
        c.drawString(100, 720, f"Invoice #: {invoice_id}")
        c.drawString(100, 700, f"Date: {datetime.now().strftime('%Y-%m-%d')}")

        c.drawString(
            100, 670, f"Guest: {getattr(user, 'full_name', getattr(user, 'name', ''))}"
        )
        c.drawString(100, 650, f"Email: {user.email}")

        c.drawString(100, 620, f"Room: {room.room_number} ({room.room_type})")
        c.drawString(100, 600, f"Check-in: {reservation.check_in_date}")
        c.drawString(100, 580, f"Check-out: {reservation.check_out_date}")
        c.drawString(100, 560, f"Nights: {reservation.total_nights}")

        c.drawString(100, 530, f"Payment Method: {payment.payment_method}")
        c.drawString(100, 510, f"Transaction ID: {payment.transaction_id or 'N/A'}")

        if invoice_type == "advance":
            c.drawString(100, 480, f"Advance Amount: {payment.amount:.2f}")
            c.drawString(100, 460, f"Total Amount: {reservation.total_price:.2f}")
            c.drawString(
                100, 440, f"Remaining Amount: {reservation.remaining_amount:.2f}"
            )
        else:
            c.drawString(100, 480, f"Total Amount Paid: {reservation.total_price:.2f}")

        c.drawString(100, 400, "Thank you for choosing our hotel!")
        c.save()
        return abs_filename
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        return None


async def check_for_no_shows(db: Session) -> int:
    """
    Check for reservations where users didn't show up
    and mark them as no-shows
    """
    today = datetime.now().date()

    # Get potential no-shows
    no_show_reservations = crud.get_no_shows(db, today)

    # Mark each as no-show
    count = 0
    for reservation in no_show_reservations:
        try:
            crud.mark_as_no_show(db, reservation.id)
            count += 1
        except Exception as e:
            print(f"Error marking reservation {reservation.id} as no-show: {str(e)}")

    return count
