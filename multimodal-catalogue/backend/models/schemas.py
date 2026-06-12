from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

class Product(BaseModel):
    id: str
    sku: str
    name: str
    description: Optional[str] = None
    category: str
    price: float
    image_urls: List[str]
    attributes: Optional[Dict[str, Any]] = None
    ai_generated: bool = False

class SearchResult(BaseModel):
    product: Product
    score: float

class SearchRequestText(BaseModel):
    query: str
    filters: dict = {}
    top_k: int = 10

class SearchRequestCombined(BaseModel):
    query: str
    fusion_weight: float = 0.6
    top_k: int = 10

class AttributeResponse(BaseModel):
    colour: str
    style: str
    material: str
    shape: str

class DescriptionResponse(BaseModel):
    description: str

class SeedKeywordsRequest(BaseModel):
    seed_keywords: List[str] = []

class ClickEventRequest(BaseModel):
    event_id: str
    product_id: str

class AnalyticsSummary(BaseModel):
    total_searches: int
    ctr_by_modality: Dict[str, float]
    zero_result_rate: float
    abandonment_rate: float
    top_abandoned_queries: List[Dict[str, Any]]
    daily_volume: List[Dict[str, Any]]

class GapReport(BaseModel):
    top_zero_result_queries: List[Dict[str, Any]]
