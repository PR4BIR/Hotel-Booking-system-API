import os
import smtplib
from email.message import EmailMessage
from typing import Optional

from app.core.config import settings


def send_email(
    to_email: str, subject: str, content: str, attachment_path: Optional[str] = None
):
    """
    Central function for sending all emails
    """
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_USER
    msg["To"] = to_email
    msg.set_content(content)

    # Add attachment if provided
    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            file_data = f.read()
            file_name = os.path.basename(attachment_path)
            if attachment_path.endswith(".pdf"):
                msg.add_attachment(
                    file_data, maintype="application", subtype="pdf", filename=file_name
                )
            else:
                msg.add_attachment(
                    file_data,
                    maintype="application",
                    subtype="octet-stream",
                    filename=file_name,
                )

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            smtp.send_message(msg)
            print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False


def send_otp_email(to_email: str, otp: str):
    """
    Send OTP verification email
    """
    subject = "Your OTP - Hotel Reservation System"
    content = (
        f"Hello,\n\nYour OTP for verifying your account is: {otp}\n\n"
        f"This OTP is valid for 10 minutes.\n\n"
        f"Thank you,\nHotel Reservation Team"
    )
    return send_email(to_email, subject, content)


def send_admin_payment_alert(reservation, payment):
    """
    Send payment alert to admin
    """
    subject = f"✅ Full Payment Received: Reservation #{reservation.id}"
    content = f"""
Hello Admin,

A full payment has been received for a reservation.

🔹 Reservation ID: {reservation.id}
🔹 Guest: {reservation.user.full_name} ({reservation.user.email})
🔹 Room: {reservation.room.room_number if reservation.room else "N/A"}
🔹 Check-in: {reservation.check_in_date}
🔹 Check-out: {reservation.check_out_date}
🔹 Total Price: ₹{reservation.total_price}
🔹 Paid Amount: ₹{payment.amount}

The reservation has been confirmed and the room is marked unavailable.

Regards,
Hotel Reservation System
"""
    return send_email("admin@hotel.com", subject, content)


def send_payment_confirmation_email(to_email: str, subject: str, content: str):
    """
    Send payment confirmation email
    """
    return send_email(to_email, subject, content)


def send_invoice_email(to_email: str, filename: str, filepath: str):
    """
    Send invoice email with PDF attachment
    """
    subject = "Your Invoice - Nilaya Stay"
    content = "Dear Guest,\n\nThank you for choosing Nilaya Stay. Your invoice is attached with this email.\n\nWarm regards,\nNilaya Stay Team"
    return send_email(to_email, subject, content, attachment_path=filepath)
