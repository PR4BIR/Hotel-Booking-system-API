import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.crud.invoice import create_invoice
from app.models.reservation import Reservation
from app.models.user import User
from app.services.email_utils import send_invoice_email  # Use the centralized function


def generate_invoice_pdf_and_email(
    db, reservation: Reservation, invoice_type: str = "final"
):
    user: User = reservation.user
    invoice_id = f"INV-{invoice_type.upper()}-{reservation.id:04d}"
    filename = f"{invoice_id}.pdf"
    pdf_path = os.path.join("invoices", filename)

    os.makedirs("invoices", exist_ok=True)

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # ───── Logo (Optional) ─────
    logo_path = "app/static/logo.png"
    if os.path.exists(logo_path):
        c.drawImage(
            logo_path, 40, height - 80, width=80, height=60, preserveAspectRatio=True
        )

    # ───── Hotel Info ─────
    c.setFont("Helvetica-Bold", 16)
    c.drawString(130, height - 50, "Nilaya Stay")
    c.setFont("Helvetica", 10)
    c.drawString(130, height - 65, "Your Peaceful Stay Begins Here")
    c.drawString(130, height - 78, "support@nilayastay.com | +91-999-999-9999")

    c.setStrokeColor(colors.grey)
    c.line(30, height - 90, width - 30, height - 90)

    # ───── Invoice Header ─────
    c.setFont("Helvetica-Bold", 12)
    c.drawString(30, height - 110, f"Invoice #: {invoice_id}")
    c.setFont("Helvetica", 10)
    c.drawString(400, height - 110, f"Date: {datetime.utcnow().strftime('%Y-%m-%d')}")

    # ───── Guest Info ─────
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30, height - 140, "Guest Information")
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 155, f"Name: {user.full_name}")
    c.drawString(40, height - 170, f"Email: {user.email}")
    c.drawString(40, height - 185, f"Phone: {user.phone or 'N/A'}")

    # ───── Reservation Details ─────
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30, height - 210, "Reservation Details")
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 225, f"Reservation ID: {reservation.id}")
    c.drawString(40, height - 240, f"Room ID: {reservation.room.room_number}")
    c.drawString(40, height - 255, f"Room Type: {reservation.room.room_type}")
    c.drawString(40, height - 270, f"Check-in: {reservation.check_in_date}")
    c.drawString(40, height - 285, f"Check-out: {reservation.check_out_date}")
    c.drawString(40, height - 300, f"Total Nights: {reservation.total_nights}")
    c.drawString(40, height - 315, f"Status: {reservation.booking_status}")

    # ───── Payment Info ─────
    c.setFont("Helvetica-Bold", 11)
    c.drawString(30, height - 340, "Payment Summary")
    c.setFont("Helvetica", 10)
    c.drawString(40, height - 355, f"Total Price: ₹{reservation.total_price:.2f}")

    if invoice_type == "advance":
        c.drawString(
            40, height - 370, f"Advance Paid: ₹{reservation.advance_amount:.2f}"
        )
        c.drawString(
            40,
            height - 385,
            f"Remaining Balance: ₹{reservation.total_price - reservation.advance_amount:.2f}",
        )
        c.drawString(40, height - 400, "Invoice Type: Advance")
    else:
        c.drawString(40, height - 370, f"Total Paid: ₹{reservation.total_price:.2f}")
        c.drawString(40, height - 385, "Invoice Type: Final (Full Payment)")

    # ───── Footer ─────
    c.setStrokeColor(colors.grey)
    c.line(30, 80, width - 30, 80)
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(30, 65, "Thank you for staying with Nilaya Stay!")
    c.drawString(30, 50, "support@nilayastay.com | +91-999-999-9999")

    c.save()

    # ✅ Save invoice record with invoice_type
    create_invoice(db, reservation.id, pdf_path, invoice_type=invoice_type)

    # ✅ Email invoice using the centralized function
    send_invoice_email(user.email, filename, pdf_path)
