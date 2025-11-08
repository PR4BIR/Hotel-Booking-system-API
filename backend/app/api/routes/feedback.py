from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud import feedback as crud_feedback
from app.db.session import get_db
from app.models.room import Room
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedbacks", tags=["Feedback"])


# ✅ Submit Feedback
@router.post("/", response_model=FeedbackOut)
def create_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate room
    room = db.query(Room).filter(Room.id == feedback.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Prevent duplicate feedback
    existing = (
        db.query(crud_feedback.Feedback)
        .filter(
            crud_feedback.Feedback.user_id == current_user.id,
            crud_feedback.Feedback.room_id == feedback.room_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400, detail="You have already submitted feedback for this room."
        )

    return crud_feedback.create_feedback(
        db=db,
        user_id=current_user.id,
        room_id=feedback.room_id,
        rating=feedback.rating,
        comment=feedback.comment,
    )


# ✅ Get all feedbacks (admin) or own (user)
@router.get("/", response_model=List[FeedbackOut])
def list_feedbacks(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return db.query(crud_feedback.Feedback).all()
    return crud_feedback.get_feedback_by_user(db, current_user.id)


# ✅ Get feedbacks for a room (public)
@router.get("/room/{room_id}", response_model=List[FeedbackOut])
def get_feedbacks_by_room(room_id: int, db: Session = Depends(get_db)):
    return crud_feedback.get_feedback_for_room(db, room_id)
