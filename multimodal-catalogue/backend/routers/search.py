from fastapi import APIRouter, File, UploadFile, Form, Depends
from typing import Optional, List
from io import BytesIO
from PIL import Image
import uuid
from backend.models.schemas import SearchRequestText, SearchResult, Product
from backend.services.embedder import embedder
from backend.services.retriever import retriever
from backend.db.database import get_db, SearchEventModel, ProductModel
from sqlalchemy.ext.asyncio import AsyncSession
import time
from sentence_transformers import CrossEncoder

router = APIRouter(prefix="/api/search", tags=["search"])
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

async def log_search(db: AsyncSession, modality: str, query: str = None, count: int = 0, ms: int = 0) -> str:
    evt_id = str(uuid.uuid4())
    evt = SearchEventModel(
        id=evt_id,
        session_id="anon",
        modality=modality,
        query_text=query,
        result_count=count,
        latency_ms=ms,
        abandoned=True
    )
    db.add(evt)
    await db.commit()
    return evt_id

async def inflate_results(db: AsyncSession, raw_results: list) -> List[SearchResult]:
    hydrated = []
    for r in raw_results:
        prod = await db.get(ProductModel, r["product_id"])
        if prod:
            p = Product(
                id=prod.id,
                sku=prod.sku,
                name=prod.name,
                description=prod.description,
                category=prod.category,
                price=prod.price,
                image_urls=prod.image_urls,
                attributes=prod.attributes,
                ai_generated=prod.ai_generated
            )
            hydrated.append(SearchResult(product=p, score=1 - r["distance"]))
    return hydrated

@router.post("/text")
async def search_text(req: SearchRequestText, db: AsyncSession = Depends(get_db)):
    start = time.time()
    
    emb = embedder.encode_text(req.query).tolist()
    # retrieve top 50, then rerank
    raw = retriever.search_by_text(emb, top_k=50, filters=req.filters)
    results = await inflate_results(db, raw)
    
    if results:
        # Cross encoder reranking
        pairs = [[req.query, f"{r.product.name} {r.product.description}"] for r in results]
        scores = cross_encoder.predict(pairs)
        for r, score in zip(results, scores):
            r.score = float(score)
        
        results.sort(key=lambda x: x.score, reverse=True)
    
    final_res = results[:req.top_k]
    
    ms = int((time.time() - start) * 1000)
    evt_id = await log_search(db, "text", req.query, len(final_res), ms)
    
    return {"results": final_res, "event_id": evt_id}

@router.post("/image")
async def search_image(image: UploadFile = File(...), top_k: int = Form(10), db: AsyncSession = Depends(get_db)):
    start = time.time()
    
    img_data = await image.read()
    pil_image = Image.open(BytesIO(img_data)).convert("RGB")
    emb = embedder.encode_image(pil_image).tolist()
    
    raw = retriever.search_by_image(emb, top_k=top_k)
    results = await inflate_results(db, raw)
    
    ms = int((time.time() - start) * 1000)
    evt_id = await log_search(db, "image", count=len(results), ms=ms)
    
    return {"results": results, "event_id": evt_id}

@router.post("/combined")
async def search_combined(
    image: UploadFile = File(...),
    query: str = Form(...),
    fusion_weight: float = Form(0.6),
    top_k: int = Form(10),
    db: AsyncSession = Depends(get_db)
):
    start = time.time()
    
    img_data = await image.read()
    pil_image = Image.open(BytesIO(img_data)).convert("RGB")
    emb = embedder.encode_combined(query, pil_image, alpha=fusion_weight).tolist()
    
    raw = retriever.search_combined(emb, top_k=top_k)
    results = await inflate_results(db, raw)
    
    ms = int((time.time() - start) * 1000)
    evt_id = await log_search(db, "combined", query, len(results), ms)
    
    return {"results": results, "event_id": evt_id}
