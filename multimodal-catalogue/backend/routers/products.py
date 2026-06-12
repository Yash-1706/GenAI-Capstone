from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.db.database import get_db, ProductModel
from backend.models.schemas import Product, SeedKeywordsRequest
from backend.services.llm import llm_service
from PIL import Image
import requests
from io import BytesIO
from backend.services.retriever import retriever
from backend.routers.search import inflate_results

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/{id}", response_model=Product)
async def get_product(id: str, db: AsyncSession = Depends(get_db)):
    prod = await db.get(ProductModel, id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Product(
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

def fetch_image_from_url(url: str) -> Image.Image:
    try:
        response = requests.get(url, timeout=10)
        return Image.open(BytesIO(response.content)).convert("RGB")
    except:
        return Image.new("RGB", (400, 400), color=(255,255,255))

@router.post("/{id}/describe")
async def extract_description(id: str, req: SeedKeywordsRequest, db: AsyncSession = Depends(get_db)):
    prod = await db.get(ProductModel, id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    image = fetch_image_from_url(prod.image_urls[0])
    desc = llm_service.generate_description(image, seed_keywords=req.seed_keywords)
    
    if not prod.description or len(prod.description) < 10:
        prod.description = desc
        prod.ai_generated = True
        await db.commit()
        
    return {"description": desc}

@router.post("/{id}/extract-attributes")
async def extract_attributes(id: str, db: AsyncSession = Depends(get_db)):
    prod = await db.get(ProductModel, id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    image = fetch_image_from_url(prod.image_urls[0])
    attrs = llm_service.extract_attributes(image)
    
    prod.attributes = attrs
    await db.commit()
    
    return {"attributes": attrs}

@router.get("/{id}/similar")
async def get_similar_products(id: str, db: AsyncSession = Depends(get_db)):
    prod = await db.get(ProductModel, id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
        
    emb = retriever.get_image_embedding_by_id(id)
    if not emb:
        return {"results": []}
        
    raw = retriever.search_by_image(emb, top_k=6)
    raw = [r for r in raw if str(r["product_id"]) != str(id)][:4]
    
    results = await inflate_results(db, raw)
    return {"results": results}

