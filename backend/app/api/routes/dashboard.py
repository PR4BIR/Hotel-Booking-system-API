import csv
import os
import uuid
import zipfile
from datetime import date
from io import StringIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import func, not_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.invoice import Invoice
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.user import User
from app.services.cleanup import delete_old_cancelled_and_noshow_reservations

router = APIRouter(prefix="/dashboard", tags=["Admin Dashboard"])


# ✅ Admin-only analytics summary (with unpaid insights)
@router.get("/analytics")
def get_admin_analytics(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    today = date.today()

    total_users = db.query(func.count(User.id)).scalar()
    total_reservations = db.query(func.count(Reservation.id)).scalar()
    total_cancelled = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.booking_status == "cancelled")
        .scalar()
    )
    total_no_shows = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.check_in_status == "no-show")
        .scalar()
    )
    active_bookings = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.booking_status == "confirmed",
            Reservation.check_in_date >= today,
        )
        .scalar()
    )

    total_earnings = db.query(func.coalesce(func.sum(Payment.amount), 0)).scalar()

    # Unpaid / advance not paid
    unpaid = (
        db.query(Reservation)
        .filter(
            not_(Reservation.advance_paid), Reservation.booking_status != "cancelled"
        )
        .all()
    )

    unpaid_data = [
        {
            "reservation_id": r.id,
            "user_email": r.user.email,
            "room": r.room.room_number if r.room else None,
            "total_price": r.total_price,
            "advance_paid": r.advance_paid,
            "booking_status": r.booking_status,
        }
        for r in unpaid
    ]

    return {
        "total_users": total_users,  # ✅ Added
        "total_reservations": total_reservations,
        "cancelled_reservations": total_cancelled,
        "no_show_reservations": total_no_shows,
        "active_upcoming_bookings": active_bookings,
        "total_earnings": round(total_earnings, 2),
        "pending_payments": len(unpaid_data),
        "unpaid_reservations": unpaid_data,
    }


# ✅ Export reservation report as CSV
@router.get("/export-reservations")
def export_reservations_csv(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    reservations = db.query(Reservation).all()
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Reservation ID",
            "User ID",
            "Room ID",
            "Room No",
            "Check-In",
            "Check-Out",
            "Total Nights",
            "Total Price",
            "Advance",
            "Advance Paid",
            "Status",
            "Check-In Status",
            "Created At",
        ]
    )

    for res in reservations:
        writer.writerow(
            [
                res.id,
                res.user_id,
                res.room_id,
                res.room.room_number if res.room else "",
                res.check_in_date,
                res.check_out_date,
                res.total_nights,
                res.total_price,
                res.advance_amount,
                "Yes" if res.advance_paid else "No",
                res.booking_status,
                res.check_in_status,
                res.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=reservations_report.csv"},
    )


# ✅ Export all invoice PDFs as ZIP
@router.get("/export-invoices-zip")
def export_all_invoices_zip(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    invoices = db.query(Invoice).all()
    if not invoices:
        raise HTTPException(status_code=404, detail="No invoices to export")

    export_dir = "temp_exports"
    os.makedirs(export_dir, exist_ok=True)

    zip_filename = f"invoices_export_{uuid.uuid4().hex}.zip"
    zip_path = os.path.join(export_dir, zip_filename)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for inv in invoices:
            if inv.pdf_path and os.path.exists(inv.pdf_path):
                arcname = os.path.basename(inv.pdf_path)
                zipf.write(inv.pdf_path, arcname=arcname)

    if not os.path.exists(zip_path):
        raise HTTPException(status_code=500, detail="ZIP creation failed")

    return FileResponse(
        zip_path, media_type="application/zip", filename="invoices_export.zip"
    )


# ✅ Clean up old no-show / cancelled reservations
@router.delete("/cleanup-reservations")
def cleanup_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    days: int = 30,
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    deleted = delete_old_cancelled_and_noshow_reservations(db, days_old=days)
    return {"deleted_reservation_ids": deleted, "deleted_count": len(deleted)}
