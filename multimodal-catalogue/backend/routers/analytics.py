from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from backend.db.database import get_db, SearchEventModel
from backend.models.schemas import ClickEventRequest
import datetime

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.post("/click")
async def register_click(req: ClickEventRequest, db: AsyncSession = Depends(get_db)):
    evt = await db.get(SearchEventModel, str(req.event_id))
    if evt:
        evt.clicked_product_id = str(req.product_id)
        evt.abandoned = False
        await db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Event not found")

@router.get("/summary")
async def get_summary(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.count(SearchEventModel.id)))
    if total == 0:
        return {
            "total_searches": 0,
            "ctr_by_modality": {},
            "zero_result_rate": 0,
            "abandonment_rate": 0,
            "top_abandoned_queries": [],
            "daily_volume": []
        }

    # Modality counts
    modalities = await db.execute(select(SearchEventModel.modality, func.count(), func.sum(func.cast(SearchEventModel.abandoned == False, func.integer()))).group_by(SearchEventModel.modality))
    ctr_by_modality = {}
    for modality, count, clicks in modalities:
        ctr_by_modality[modality] = (clicks / count) if count > 0 else 0

    zero_results = await db.scalar(select(func.count(SearchEventModel.id)).where(SearchEventModel.result_count == 0))
    abandoned = await db.scalar(select(func.count(SearchEventModel.id)).where(SearchEventModel.abandoned == True))

    abandoned_queries = await db.execute(
        select(SearchEventModel.query_text, func.count())
        .where(SearchEventModel.abandoned == True)
        .where(SearchEventModel.query_text != None)
        .group_by(SearchEventModel.query_text)
        .order_by(desc(func.count()))
        .limit(10)
    )
    
    top_abandoned = [{"query": q, "count": c} for q, c in abandoned_queries]

    # Daily volume (simple mockup, group by date string)
    daily = await db.execute(
        select(func.date(SearchEventModel.created_at), func.count())
        .group_by(func.date(SearchEventModel.created_at))
        .order_by(func.date(SearchEventModel.created_at))
    )
    daily_vol = [{"date": d, "count": c} for d, c in daily]

    return {
        "total_searches": total,
        "ctr_by_modality": ctr_by_modality,
        "zero_result_rate": zero_results / total,
        "abandonment_rate": abandoned / total,
        "top_abandoned_queries": top_abandoned,
        "daily_volume": daily_vol
    }

@router.get("/gaps")
async def get_gaps(db: AsyncSession = Depends(get_db)):
    gaps = await db.execute(
        select(SearchEventModel.query_text, func.count())
        .where(SearchEventModel.result_count == 0)
        .where(SearchEventModel.query_text != None)
        .group_by(SearchEventModel.query_text)
        .order_by(desc(func.count()))
        .limit(10)
    )
    return {"top_zero_result_queries": [{"query": q, "count": c} for q, c in gaps]}
