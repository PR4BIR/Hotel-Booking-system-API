from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.feedback import Feedback


def create_feedback(
    db: Session, user_id: int, room_id: int, rating: int, comment: str | None
):
    # Optional: prevent duplicate
    existing = (
        db.query(Feedback)
        .filter(Feedback.user_id == user_id, Feedback.room_id == room_id)
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="Feedback already submitted for this room."
        )

    db_feedback = Feedback(
        user_id=user_id,
        room_id=room_id,
        rating=rating,
        comment=comment,
        submitted_at=datetime.utcnow(),
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


def get_feedback_for_room(db: Session, room_id: int):
    return db.query(Feedback).filter(Feedback.room_id == room_id).all()


def get_feedback_by_user(db: Session, user_id: int):
    return db.query(Feedback).filter(Feedback.user_id == user_id).all()
