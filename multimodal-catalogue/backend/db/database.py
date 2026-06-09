from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import String, Float, Boolean, JSON, Integer, DateTime
import uuid
from typing import Optional
from datetime import datetime

DATABASE_URL = "sqlite+aiosqlite:///./catalogue.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()

class ProductModel(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, index=True)
    price: Mapped[float] = mapped_column(Float)
    image_urls: Mapped[dict] = mapped_column(JSON)
    attributes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    text_embedding_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

class SearchEventModel(Base):
    __tablename__ = "search_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(36), index=True)
    modality: Mapped[str] = mapped_column(String) # text, image, combined
    query_text: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    query_image_hash: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    result_count: Mapped[int] = mapped_column(Integer)
    clicked_product_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    abandoned: Mapped[bool] = mapped_column(Boolean, default=True)
    latency_ms: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
