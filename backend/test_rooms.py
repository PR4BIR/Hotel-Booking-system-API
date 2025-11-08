from app.db.session import SessionLocal
from app.models.room import Room


def check_rooms():
    db = SessionLocal()
    try:
        rooms = db.query(Room).all()
        print(f"📊 Total rooms in database: {len(rooms)}")

        if rooms:
            print("\n🏨 Room details:")
            for room in rooms:
                print(
                    f"  - Room {room.room_number}: {room.room_type} (${room.price_per_night}/night) - Available: {room.is_available}"
                )
        else:
            print("❌ No rooms found in database!")

        # Check featured rooms specifically
        featured = db.query(Room).filter(Room.is_available).limit(6).all()
        print(f"\n⭐ Featured rooms: {len(featured)}")

    finally:
        db.close()


if __name__ == "__main__":
    check_rooms()
