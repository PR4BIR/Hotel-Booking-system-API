# Add this to your existing room.py file or update it:

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.room import Room
from app.schemas.room import RoomOut

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/", response_model=List[RoomOut])
def get_all_rooms(db: Session = Depends(get_db)):
    """Get all rooms - no authentication required for browsing"""
    rooms = db.query(Room).all()
    return rooms


@router.get("/featured", response_model=List[RoomOut])
def get_featured_rooms(db: Session = Depends(get_db)):
    """Get featured rooms for homepage - no authentication required"""
    rooms = db.query(Room).filter(Room.is_available).limit(6).all()
    return rooms


@router.get("/available", response_model=List[RoomOut])
def get_available_rooms(db: Session = Depends(get_db)):
    """Get only available rooms"""
    rooms = db.query(Room).filter(Room.is_available).all()
    return rooms
