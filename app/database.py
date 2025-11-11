from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres"
)

# echo=True can be turned on for SQL logging during development
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

def init_db():
    # Import models here to ensure they are registered with Base.metadata
    from . import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
