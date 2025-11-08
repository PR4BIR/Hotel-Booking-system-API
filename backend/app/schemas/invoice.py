from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from decimal import Decimal

class InvoiceBase(BaseModel):
    reservation_id: int
    amount: Decimal
    tax_amount: Optional[Decimal] = None
    total_amount: Decimal

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(BaseModel):
    id: int
    reservation_id: int
    invoice_number: str
    amount: Decimal
    tax_amount: Optional[Decimal] = None
    total_amount: Decimal
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class InvoiceOut(InvoiceBase):
    id: int
    invoice_number: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True