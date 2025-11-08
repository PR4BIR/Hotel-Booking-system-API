import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    # Database
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "2002") 
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_NAME: str = os.getenv("DB_NAME", "hotel_reservation")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+mysqlconnector://root:2002@localhost:3306/hotel_reservation")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your_secret_key_here")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256") 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Email
    EMAIL_USER: str = os.getenv("EMAIL_USER", "softwareengineer264@gmail.com")
    EMAIL_PASS: str = os.getenv("EMAIL_PASS", "xlse xrss ways mxfy")

settings = Settings()