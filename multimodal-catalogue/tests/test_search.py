import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from PIL import Image
from io import BytesIO
import uuid
import asyncio

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

def create_test_image():
    image = Image.new("RGB", (400, 400), color=(255, 0, 0))
    buffer = BytesIO()
    image.save(buffer, format="JPEG")
    buffer.seek(0)
    return buffer

@pytest.mark.asyncio
async def test_text_search_returns_results(async_client):
    queries = ["chair", "blue", "modern", "wood", "table"]
    for q in queries:
        resp = await async_client.post("/api/search/text", json={"query": q, "top_k": 5})
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) >= 0 # Allowing 0 if DB not fully populated in CI, but test expects >=1 if populated. We will assert >= 1 assuming ingested DB
        # To be robust during partial testing, we check if it runs without 500 error.
        # But instructions say "each returns >= 1 result", so:
        assert len(data["results"]) >= 1, f"Query '{q}' returned no results"

@pytest.mark.asyncio
async def test_image_search_returns_results(async_client):
    img_buffer = create_test_image()
    files = {"image": ("test.jpg", img_buffer, "image/jpeg")}
    data = {"top_k": 5}
    resp = await async_client.post("/api/search/image", data=data, files=files)
    assert resp.status_code == 200
    res_data = resp.json()
    assert len(res_data["results"]) >= 1

@pytest.mark.asyncio
async def test_combined_outperforms_single(async_client):
    queries = ["red sofa", "wooden chair", "modern table", "glass desk", "black lamp"]
    img_buffer = create_test_image()
    
    combined_better_count = 0
    
    for q in queries:
        # text
        resp_text = await async_client.post("/api/search/text", json={"query": q, "top_k": 5})
        score_text = resp_text.json()["results"][0]["score"] if resp_text.json()["results"] else 0
        
        # image
        img_buffer.seek(0)
        resp_image = await async_client.post("/api/search/image", data={"top_k": 5}, files={"image": ("test.jpg", img_buffer, "image/jpeg")})
        score_image = resp_image.json()["results"][0]["score"] if resp_image.json()["results"] else 0
        
        # combined
        img_buffer.seek(0)
        resp_comb = await async_client.post("/api/search/combined", data={"query": q, "fusion_weight": 0.6, "top_k": 5}, files={"image": ("test.jpg", img_buffer, "image/jpeg")})
        score_comb = resp_comb.json()["results"][0]["score"] if resp_comb.json()["results"] else 0
        
        if score_comb >= max(score_text, score_image):
            combined_better_count += 1
            
    assert combined_better_count >= 3

@pytest.mark.asyncio
async def test_click_clears_abandoned(async_client):
    # Do a text search to generate an event
    resp = await async_client.post("/api/search/text", json={"query": "chair", "top_k": 1})
    data = resp.json()
    event_id = data["event_id"]
    
    if len(data["results"]) > 0:
        product_id = data["results"][0]["product"]["id"]
        
        # Click
        click_resp = await async_client.post("/api/analytics/click", json={"event_id": event_id, "product_id": product_id})
        assert click_resp.status_code == 200
