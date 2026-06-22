"""Health/liveness endpoints for container orchestration.

This module is intentionally dependency-light: it imports nothing from the AI
stack (CLIP, sentence-transformers, Gemini) so a health probe stays cheap and
fast and never blocks on model initialization. It exposes:

- GET /health      : liveness — the process is up and serving requests.
- GET /health/ready : readiness — same plus how long the process has been alive,
                      useful for deploy/rollout gates.

These are consumed by the Docker HEALTHCHECK and by Hugging Face Spaces, which
poll a lightweight endpoint to decide whether the container is healthy.
"""

import time

from fastapi import APIRouter

router = APIRouter(tags=["health"])

SERVICE_NAME = "multimodal-catalogue"
_START_TIME = time.time()


@router.get("/health")
def health_check():
    """Liveness probe. Cheap and side-effect free."""
    return {
        "status": "ok",
        "service": SERVICE_NAME,
        "uptime_seconds": round(time.time() - _START_TIME, 2),
    }


@router.get("/health/ready")
def readiness_check():
    """Readiness probe. Returns the same liveness signal plus uptime so a
    deploy gate can wait until the process has been stable for a moment."""
    return {
        "status": "ready",
        "service": SERVICE_NAME,
        "uptime_seconds": round(time.time() - _START_TIME, 2),
    }
