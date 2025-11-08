from sqlalchemy.orm import Session

from app.services.payment_service import check_for_no_shows


def mark_no_shows(db: Session):
    """
    Mark reservations as no-shows using the consolidated functionality
    """
    return check_for_no_shows(db)
