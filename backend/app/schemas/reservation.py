from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional
from decimal import Decimal

class ReservationBase(BaseModel):
    room_id: int
    user_id: int
    check_in_date: date
    check_out_date: date
    guests: int
    total_amount: Decimal

class ReservationCreate(ReservationBase):
    pass

class ReservationResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    check_in_date: date
    check_out_date: date
    guests: int
    total_amount: Decimal
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ReservationOut(ReservationBase):
    id: int
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True