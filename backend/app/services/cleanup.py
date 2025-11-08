from sqlalchemy.orm import Session
from app.models.reservation import Reservation
from datetime import datetime, timedelta

def delete_old_cancelled_and_noshow_reservations(db: Session, days_old: int = 30):
    threshold = datetime.utcnow() - timedelta(days=days_old)

    old_reservations = db.query(Reservation).filter(
        Reservation.created_at < threshold,
        Reservation.booking_status.in_(["cancelled"]),
        Reservation.check_in_status.in_(["no-show"])
    ).all()

    deleted_ids = [r.id for r in old_reservations]

    for r in old_reservations:
        db.delete(r)

    db.commit()
    return deleted_ids
