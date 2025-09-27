from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from typing import AsyncGenerator

# Create async engine
engine = create_async_engine(
    settings.POSTGRES_URL,
    echo=True,  # Set to False in production
    future=True
)

# Create async session factory
async_session_factory = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get database session"""
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()

# TODO: Define all SQLAlchemy models in a separate models.py file
