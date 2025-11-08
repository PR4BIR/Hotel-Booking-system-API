import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import existing routers
# Import new routes we just created
from app.api.routes import (
    auth,
    dashboard,
    feedback,
    invoice,
    payment,
    promotions,
    reservation,
    room,
    rooms,
    testimonials,
    user,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Hotel Reservation System", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router, prefix="/api")
app.include_router(user.router, prefix="/api")
app.include_router(room.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(reservation.router, prefix="/api")
app.include_router(payment.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(invoice.router, prefix="/api")

# Include new routes if they exist
if rooms:
    app.include_router(rooms.router, prefix="/api")
if testimonials:
    app.include_router(testimonials.router, prefix="/api")
if promotions:
    app.include_router(promotions.router, prefix="/api")


@app.get("/api/testimonials")
def get_testimonials():
    return [
        {"id": 1, "name": "John Doe", "comment": "Great service!", "rating": 5},
        {"id": 2, "name": "Jane Smith", "comment": "Amazing experience!", "rating": 5},
    ]


@app.get("/api/promotions")
def get_promotions():
    return [
        {
            "id": 1,
            "title": "Weekend Special",
            "description": "20% off weekends",
            "discount": 20,
        }
    ]


@app.get("/")
def root():
    return {"message": "✅ Hotel Reservation API is running"}
