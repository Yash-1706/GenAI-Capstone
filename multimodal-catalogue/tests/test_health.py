"""Tests for the health/liveness endpoints.

These mount the health router on a bare FastAPI app instead of importing
``backend.main``. That keeps the test fast and free of the AI stack (CLIP,
sentence-transformers, Gemini), which is exactly the property the health
endpoints themselves are designed to have.
"""

import pytest
from fastapi import FastAPI
from httpx import AsyncClient, ASGITransport

from backend.routers.health import router, SERVICE_NAME


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def app():
    test_app = FastAPI()
    test_app.include_router(router)
    return test_app


@pytest.fixture
async def async_client(app):
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client


@pytest.mark.asyncio
async def test_health_returns_ok(async_client):
    resp = await async_client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == SERVICE_NAME
    assert "uptime_seconds" in data
    assert isinstance(data["uptime_seconds"], (int, float))
    assert data["uptime_seconds"] >= 0


@pytest.mark.asyncio
async def test_readiness_returns_ready(async_client):
    resp = await async_client.get("/health/ready")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ready"
    assert data["service"] == SERVICE_NAME
    assert data["uptime_seconds"] >= 0
