from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from backend.db.database import init_db
from backend.routers import search, products, analytics, health
from backend.services.embedder import embedder

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Forces initialization of models eagerly on startup
    _ = embedder
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(search.router)
app.include_router(products.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"status": "Multimodal Catalogue API running"}
