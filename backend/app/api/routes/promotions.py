from typing import List
from fastapi import APIRouter

router = APIRouter(prefix="/promotions", tags=["Promotions"])

@router.get("/")
def get_promotions():
    return [
        {
            "id": 1,
            "title": "Weekend Special",
            "description": "Get 20% off on weekend bookings",
            "discount": 20,
            "code": "WEEKEND20",
            "validUntil": "2024-12-31",
            "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945"
        }
    ]