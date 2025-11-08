from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User


def create_admin():
    db = SessionLocal()
    try:
        existing_admin = db.query(User).filter(User.role == "admin").first()
        if existing_admin:
            print("✅ Admin already exists.")
            return

        admin = User(
            full_name="Admin",
            username="admin",
            email="dasprabir485@gmail.com",
            password=get_password_hash("admin123"),
            role="admin",
            is_verified=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Admin created successfully.")
        print("📧 Admin email: dasprabir485@gmail.com")
        print("🔑 Admin password: admin123")
        print("👤 Admin username: admin")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


def create_sample_rooms():
    """Create some sample rooms for testing"""
    db = SessionLocal()
    try:
        from app.models.room import Room

        # Check if rooms already exist
        existing_rooms = db.query(Room).first()
        if existing_rooms:
            print("✅ Sample rooms already exist.")
            return

        # Create rooms with max_occupancy field included
        sample_rooms = [
            Room(
                room_number="101",
                room_type="Standard",
                price_per_night=100.00,
                max_occupancy=2,  # Add this required field
                description="Comfortable standard room with basic amenities",
                is_available=True,
            ),
            Room(
                room_number="201",
                room_type="Deluxe",
                price_per_night=150.00,
                max_occupancy=2,  # Add this required field
                description="Spacious deluxe room with premium amenities",
                is_available=True,
            ),
            Room(
                room_number="301",
                room_type="Suite",
                price_per_night=250.00,
                max_occupancy=4,  # Add this required field
                description="Luxury suite with separate living area",
                is_available=True,
            ),
            Room(
                room_number="102",
                room_type="Standard",
                price_per_night=100.00,
                max_occupancy=2,  # Add this required field
                description="Another comfortable standard room",
                is_available=True,
            ),
            Room(
                room_number="202",
                room_type="Deluxe",
                price_per_night=150.00,
                max_occupancy=3,  # Add this required field
                description="Premium deluxe room with city view",
                is_available=True,
            ),
            Room(
                room_number="302",
                room_type="Suite",
                price_per_night=250.00,
                max_occupancy=4,  # Add this required field
                description="Executive suite with premium facilities",
                is_available=True,
            ),
        ]

        for room in sample_rooms:
            db.add(room)

        db.commit()
        print("✅ Sample rooms created successfully.")

    except Exception as e:
        print(f"❌ Error creating sample rooms: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("🗑️ Dropping existing tables (dev only)...")
    Base.metadata.drop_all(bind=engine)

    print("🛠️ Creating fresh tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created.")

    print("👤 Creating admin user...")
    create_admin()

    print("🏨 Creating sample rooms...")
    create_sample_rooms()

    print("\n🎉 Database initialization complete!")
    print("\n📋 Login Credentials:")
    print("   Email: dasprabir485@gmail.com")
    print("   Password: admin123")
    print("   Role: admin")
