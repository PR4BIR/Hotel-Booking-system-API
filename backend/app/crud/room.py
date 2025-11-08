from sqlalchemy.orm import Session
from app.models.room import Room
from app.schemas.room import RoomCreate

def get_room_by_id(db: Session, room_id: int):
    return db.query(Room).filter(Room.id == room_id).first()

def get_all_rooms(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Room).offset(skip).limit(limit).all()

def create_room(db: Session, room: RoomCreate):
    db_room = Room(
        room_number=room.room_number,
        room_type=room.room_type,
        description=room.description,
        price_per_night=room.price_per_night,
        max_occupancy=room.max_occupancy,
        is_available=True  # default
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room_availability(db: Session, room_id: int, is_available: bool):
    room = get_room_by_id(db, room_id)
    if room:
        room.is_available = is_available
        db.commit()
        db.refresh(room)
    return room

def delete_room(db: Session, room_id: int):
    room = get_room_by_id(db, room_id)
    if room:
        db.delete(room)
        db.commit()
    return room
