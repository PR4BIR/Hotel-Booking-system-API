from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class FeedbackBase(BaseModel):
    rating: int
    comment: str
    user_id: int

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackResponse(BaseModel):
    id: int
    rating: int
    comment: str
    user_id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FeedbackOut(FeedbackBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True