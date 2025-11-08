from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    print(f"🔑 Received token: {token[:20]}..." if token else "❌ No token received")
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str = payload.get("sub")
        print(f"👤 Token payload user_id: {user_id_str}")
        
        if not user_id_str:
            print("❌ No user_id in token payload")
            raise credentials_exception
            
        user_id = int(user_id_str)  # Convert string to int
        print(f"🔍 Looking for user with ID: {user_id}")
        
    except (JWTError, ValueError, TypeError) as e:
        print(f"❌ JWT decode error: {e}")
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        print(f"❌ User with ID {user_id} not found in database")
        raise credentials_exception

    print(f"✅ User authenticated: {user.email} (Role: {user.role})")
    return user

def require_admin(user: User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user