from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class PaymentBase(BaseModel):
    reservation_id: int
    amount: Decimal
    payment_method: str

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(BaseModel):
    id: int
    reservation_id: int
    amount: Decimal
    payment_method: str
    transaction_id: str
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PaymentOut(PaymentBase):
    id: int
    transaction_id: str
    status: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True