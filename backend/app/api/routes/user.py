from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud import user as crud_user
from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.payment import Payment
from app.models.reservation import Reservation
from app.models.user import User
from app.schemas.user import UserCreate, UserOut

router = APIRouter(prefix="/users", tags=["Users"])


# ✅ OTP verification request model
class OTPVerifyRequest(BaseModel):
    email: str
    otp: str


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud_user.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db, user)


# ✅ Verify OTP endpoint
@router.post("/verify-otp")
def verify_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, request.email)
    if not user or user.otp_code != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP expired")

    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Account verified successfully"}


@router.post("/resend-otp")
def resend_otp(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = crud_user.get_user_by_email(db, request.email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="User is already verified")

    # Generate new OTP
    from app.crud.user import generate_otp
    from app.services.email_utils import send_otp_email

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # Resend email
    send_otp_email(user.email, otp)

    return {"message": "OTP resent successfully to your email"}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view all users")
    return crud_user.get_all_users(db)


@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = crud_user.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if current_user.role != "admin" and current_user.id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this user"
        )
    return user


@router.get("/me/dashboard")
def get_user_dashboard(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    reservations = (
        db.query(Reservation).filter(Reservation.user_id == current_user.id).all()
    )
    payments = (
        db.query(Payment)
        .join(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .all()
    )
    feedbacks = db.query(Feedback).filter(Feedback.user_id == current_user.id).all()

    total_paid = sum(p.amount for p in payments if p.payment_status == "paid")

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
        },
        "reservations": {
            "count": len(reservations),
            "active": len([r for r in reservations if r.booking_status == "confirmed"]),
            "cancelled": len(
                [r for r in reservations if r.booking_status == "cancelled"]
            ),
            "no_shows": len(
                [r for r in reservations if r.check_in_status == "no-show"]
            ),
        },
        "payments": {"count": len(payments), "total_paid": round(total_paid, 2)},
        "feedbacks": {"count": len(feedbacks)},
    }
