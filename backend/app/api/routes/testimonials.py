from typing import List
from fastapi import APIRouter

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])

@router.get("/")
def get_testimonials():
    return [
        {
            "id": 1,
            "name": "John Doe",
            "comment": "Amazing stay! Great service.",
            "rating": 5,
            "date": "2024-01-15"
        },
        {
            "id": 2,
            "name": "Jane Smith", 
            "comment": "Beautiful rooms and friendly staff.",
            "rating": 5,
            "date": "2024-01-10"
        }
    ]