from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random

from app.services.email_utils import send_otp_email  # ✅ make sure this exists

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str):
    """Fetch a user by their email."""
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session):
    """Return all users."""
    return db.query(User).all()


def get_user_by_id(db: Session, user_id: int):
    """Fetch a single user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def generate_otp():
    """Generate a 6-digit numeric OTP as a string."""
    return str(random.randint(100000, 999999))


def create_user(db: Session, user: UserCreate):
    """Create a new user with hashed password and OTP."""
    hashed_password = pwd_context.hash(user.password)
    otp = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=10)

    db_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hashed_password,
        phone=user.phone,
        address=user.address,
        role=user.role if user.role else "guest",
        is_verified=False,
        otp_code=otp,
        otp_expires_at=otp_expiry
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # ✅ Send the OTP via email
    send_otp_email(to_email=user.email, otp=otp)

    return db_user


def delete_user(db: Session, user_id: int):
    """Delete user by ID."""
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
    return user


def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Return users with pagination."""
    return db.query(User).offset(skip).limit(limit).all()
