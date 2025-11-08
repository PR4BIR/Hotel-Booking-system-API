from typing import Optional

from pydantic import BaseModel


class RoomBase(BaseModel):
    room_number: str
    room_type: str
    price_per_night: float
    capacity: int
    description: Optional[str] = None
    amenities: Optional[str] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(RoomBase):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None


class RoomOut(BaseModel):
    id: int
    room_number: str
    room_type: str
    price_per_night: float
    capacity: int
    description: Optional[str] = None
    amenities: Optional[str] = None
    is_available: bool

    # Computed properties for frontend compatibility
    @property
    def name(self) -> str:
        return f"{self.room_type} - Room {self.room_number}"

    @property
    def price(self) -> float:
        return self.price_per_night

    @property
    def type(self) -> str:
        return self.room_type

    @property
    def image(self) -> str:
        room_images = {
            "Standard": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "Deluxe": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "Suite": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            "Premium": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        }
        return room_images.get(self.room_type, room_images["Standard"])

    class Config:
        from_attributes = True
