Assignment #8 — Multimodal Product Catalogue Intelligence **AI Agent Build Prompt** Paste this into Claude Code, Cursor, or Aider 

System: **Multimodal Product Catalogue Intelligence** Target: **Claude Code / Cursor / Aider / GPT-4o** Version: **1.0** 

## **How to Use This Prompt** 

Copy everything inside the box below and paste it as your first message to your AI coding agent. The prompt is fully self-contained — the agent has everything it needs to scaffold and implement the complete system without further clarification from you. 

## **Pro tips:** 

- Claude Code: run in an empty directory; the agent will create all files autonomously 

- Cursor: open an empty workspace folder, paste into the Composer panel 

- Set ANTHROPIC_API_KEY in .env before running ingest.py or the LLM features 

- If the agent stalls mid-build, say 'Continue from Step N' to resume 

- The sample catalogue uses Picsum placeholder images — swap for real images later 

- Re-run ingest.py any time you add products; it is fully idempotent 

## **The Prompt** 

```
# BUILD: Multimodal Product Catalogue Intelligence System
```

```
You are an expert full-stack AI engineer. Scaffold and implement a complete
multimodal product search system from scratch. Follow every instruction below
precisely. Make reasonable defaults for anything not specified. Do NOT ask
clarifying questions — build, then confirm what was created.
```

```
=========================================================================
TECH STACK (do not deviate)
```

```
=========================================================================
```

```
Backend  : Python 3.11, FastAPI, Uvicorn, Pydantic v2
AI/ML    : openai/clip-vit-base-patch32 (HuggingFace transformers)
           sentence-transformers/all-MiniLM-L6-v2 (text encoder)
           cross-encoder/ms-marco-MiniLM-L-6-v2 (re-ranker)
Vector DB: ChromaDB, persistent local storage at ./chroma_db/
LLM      : Claude claude-sonnet-4-20250514 via Anthropic Python SDK
Analytics: SQLite via SQLAlchemy async + aiosqlite
Frontend : React 18 + Vite + TypeScript + Tailwind CSS + Zustand + Axios
Charts   : Recharts
```

```
=========================================================================
STEP 1 — PROJECT SCAFFOLDING
```

```
=========================================================================
1a. Create this exact directory structure:
```

```
    multimodal-catalogue/
```

```
    ├── backend/ (main.py, config.yaml, routers/, services/, models/, db/, ingest.py)
    ├── frontend/src/ (pages/, components/, api/, store/)
    ├── data/products.json
    ├── tests/
    ├── .env.example
```

```
    └── README.md
```

```
1b. backend/requirements.txt:
```

```
    fastapi uvicorn[standard] pydantic>=2 transformers torch Pillow chromadb
    sqlalchemy[asyncio] aiosqlite anthropic python-multipart PyYAML
    sentence-transformers python-dotenv pytest pytest-asyncio
```

```
1c. frontend: React 18, Vite, TypeScript, Tailwind, Zustand, Axios,
    React Router v6, Recharts
```

```
=========================================================================
STEP 2 — SAMPLE CATALOGUE (data/products.json)
```

```
=========================================================================
20 products across 5 categories: furniture, electronics, clothing,
kitchenware, sports. Each product:
```

```
  { id (uuid), sku, name, description (some intentionally empty),
    category, price, image_urls (use https://picsum.photos/seed/{sku}/400/400) }
```

```
=========================================================================
STEP 3 — BACKEND: MODELS & DATABASE
```

```
=========================================================================
models/schemas.py — Pydantic v2 models for:
  Product, SearchResult, SearchRequest, AttributeResponse,
  DescriptionResponse, ClickEvent, AnalyticsSummary, GapReport
```

```
db/database.py — async SQLAlchemy engine (SQLite). ORM models:
  Product: mirrors Product schema + ai_generated bool
  SearchEvent: id, session_id, modality (text|image|combined),
    query_text?, query_image_hash?, result_count, clicked_product_id?,
    abandoned (bool), latency_ms, created_at
```

```
=========================================================================
STEP 4 — EMBEDDING SERVICE (services/embedder.py)
```

```
=========================================================================
Load both models on startup (singleton pattern).
```

```
encode_text(text: str) -> np.ndarray
  → sentence-transformer → 384-dim → L2 normalise
```

```
encode_image(pil_image: Image) -> np.ndarray
  → CLIP image encoder → 512-dim → L2 normalise
```

```
encode_combined(text, image, alpha=0.6) -> np.ndarray
  → project text 384→512 via stored linear map
  → combined = alpha * img_emb + (1-alpha) * text_emb → L2 normalise
  → persist projection matrix to ./projection_matrix.npy
```

```
=========================================================================
STEP 5 — VECTOR STORE (services/retriever.py)
```

```
=========================================================================
ChromaDB persistent at ./chroma_db/
```

```
Collections: 'text_embeddings' and 'image_embeddings'
```

```
Implement:
```

```
  upsert_product(product_id, text_emb, image_emb, metadata dict)
  search_by_text(query_emb, top_k, filters) -> list[SearchResult]
  search_by_image(image_emb, top_k) -> list[SearchResult]
```

```
  search_combined(combined_emb, top_k) -> list[SearchResult]
```

```
Filters are ChromaDB $where clauses on metadata. Sort desc by score.
```

```
=========================================================================
STEP 6 — INGESTION SCRIPT (ingest.py)
=========================================================================
CLI: python ingest.py --catalogue data/products.json
For each product:
```

- `Load image from URL (or skip and use a blank 400x400 if offline)` 

```
  - CLIP encode → upsert to image_embeddings with metadata
  - Sentence-transformer encode name+description → upsert to text_embeddings
  - Write product row to SQLite
Print progress. Script is idempotent (upsert, not insert).
=========================================================================
STEP 7 — LLM SERVICE (services/llm.py)
=========================================================================
Use anthropic Python SDK. Model: claude-sonnet-4-20250514.
```

```
extract_attributes(pil_image) -> dict:
```

```
  SYSTEM: 'You are a product attribute extractor. Return ONLY valid JSON.'
  USER: 'Analyse this product image. Return a JSON object with exactly
        four keys: colour, style, material, shape. Each value is a short
        phrase. Return nothing else — no explanation, no markdown, only
        the raw JSON object.'
```

```
  Parse result. On JSON error return {'colour':'','style':'','material':'','shape':''}
```

```
generate_description(pil_image, seed_keywords=[]) -> str:
  SYSTEM: 'You are an expert e-commerce copywriter.'
  USER: 'Write a compelling 50-150 word product description for this item.
        Keywords: {keywords}. Do not invent specs not visible. Return only
        the description text.'
  temperature=0.7, max_tokens=300
```

```
refine_query(original_query, prior_results_context) -> str:
  Expand conversational refinement ('same but in red') by merging with context.
```

```
=========================================================================
STEP 8 — FASTAPI ROUTERS
```

```
=========================================================================
search.py:
```

```
  POST /api/search/text
    Body: { query: str, filters: dict={}, top_k: int=10 }
```

```
    1. encode_text(query)
```

```
    2. search_by_text(emb, top_k, filters)
```

```
    3. re-rank top-50 with cross-encoder, return top_k
```

```
    4. log SearchEvent (modality='text')
    Return: { results: SearchResult[], event_id: uuid }
```

```
  POST /api/search/image
    Multipart: image (file), top_k=10
    1. encode_image(PIL.open(image_bytes))
```

```
    2. search_by_image(emb, top_k)
    3. log SearchEvent (modality='image')
    Return: { results: SearchResult[], event_id: uuid }
```

```
  POST /api/search/combined
    Multipart: image (file), query (str), fusion_weight=0.6, top_k=10
    1. encode_combined(query, image, alpha=fusion_weight)
```

`2. search_combined(emb, top_k)` 

`3. log SearchEvent (modality='combined') Return: { results: SearchResult[], event_id: uuid }` 

```
products.py:
  GET  /api/products/{id}  -> Product
  POST /api/products/{id}/describe
       Body: { seed_keywords: list[str]=[] }
       Call generate_description(); save to DB if product.description empty
       Return: { description: str }
  POST /api/products/{id}/extract-attributes
       Call extract_attributes(); save to DB
       Return: { attributes: dict }
```

```
analytics.py:
  POST /api/analytics/click
       Body: { event_id: uuid, product_id: uuid }
       Set SearchEvent.clicked_product_id, abandoned=False
  GET  /api/analytics/summary?from=&to=
       Return: { total_searches, ctr_by_modality, zero_result_rate,
         abandonment_rate, top_abandoned_queries, daily_volume }
  GET  /api/analytics/gaps
```

```
       Return top 10 zero-result query clusters
```

```
main.py:
```

```
  Mount all routers. CORS allow all origins. Startup: init DB + load models.
  Load ANTHROPIC_API_KEY from .env via python-dotenv.
```

```
=========================================================================
STEP 9 — FRONTEND
```

```
=========================================================================
SearchPage (route: /)
```

- `Text input with debounced suggestions (300 ms)` 

- `Drag-and-drop image upload zone` 

- `Modality toggle: Text | Image | Combined` 

- `Fusion weight slider (0.0–1.0, default 0.6) — show only in Combined mode` 

- `Attribute filter sidebar: colour chips, category pills, price range slider` 

- `On submit: call API → navigate to /results with results in Zustand store` 

## `ResultsGrid (route: /results)` 

- `Responsive 3-col grid of ProductCard` 

- `ProductCard: image, name, price, similarity score badge, attribute tags` 

- `On click: POST /api/analytics/click → navigate to /product/:id` 

## `ProductDetail (route: /product/:id)` 

- `Full image, name, price, description, attribute chips` 

- `'Generate Description' button (if description missing or < 20 chars)` 

- `'Extract Attributes' button` 

- `'Similar Products' section (re-run image search with this product's image)` 

```
AnalyticsDashboard (route: /analytics — protected with hardcoded token)
```

- `Recharts line chart: daily search volume` 

- `Recharts bar chart: CTR by modality` 

```
  - Stat cards: total searches, abandonment rate, zero-result rate
```

```
  - Table: top 10 abandoned queries
```

```
  - Table: catalogue gap report
```

```
Global: dark-mode toggle, responsive navbar, loading skeletons, error states.
```

```
=========================================================================
STEP 10 — CONFIG & ENVIRONMENT
```

```
=========================================================================
backend/config.yaml:
  fusion_alpha: 0.6
  clip_model: openai/clip-vit-base-patch32
  text_model: sentence-transformers/all-MiniLM-L6-v2
  reranker_model: cross-encoder/ms-marco-MiniLM-L-6-v2
  top_k_default: 10
```

```
  rerank_pool: 50
  abandonment_timeout_seconds: 300
```

```
.env.example:  ANTHROPIC_API_KEY=your_key_here
```

```
.gitignore:    __pycache__, *.pyc, .env, chroma_db/, node_modules/, dist/
```

```
=========================================================================
STEP 11 — TESTS (tests/test_search.py)
```

```
=========================================================================
Use pytest + pytest-asyncio. Mock Anthropic API calls.
```

## `Tests to implement:` 

```
  - text_search_returns_results: 5 diverse queries, each returns >= 1 result
```

- `image_search_returns_results: encode test image, returns >= 1 result - combined_outperforms_single: on 3 of 5 ambiguous queries, combined score >= max(text_score, image_score)` 

```
  - attribute_extraction_has_all_keys: dict contains colour, style, material, shape
  - description_length: generated text is 50-150 words
```

```
  - click_clears_abandoned: POST click → SearchEvent.abandoned == False
```

```
=========================================================================
QUALITY STANDARDS
```

```
=========================================================================
```

```
- All FastAPI endpoints have response_model
```

```
- All DB operations are async
```

- `Errors return { error: str, detail: str }` 

```
- TypeScript strict mode, no 'any' types
```

```
- Loading + error states in every component
```

```
- No console.log in production code
```

```
=========================================================================
DELIVERABLE CHECKLIST (confirm each after building)
```

```
=========================================================================
```

```
[ ] python ingest.py runs on data/products.json without error
```

```
[ ] uvicorn backend.main:app starts; /docs loads all 9 endpoints
```

```
[ ] Text search returns semantically relevant results
```

```
[ ] Image search returns results for a test upload
```

```
[ ] Combined search works end-to-end
```

```
[ ] Attribute extraction returns all 4 keys
```

```
[ ] Description generation returns 50-150 word copy
```

```
[ ] Analytics dashboard renders live charts
```

```
[ ] pytest >= 80% pass rate
```

```
[ ] README has complete setup instructions
```

```
Build step by step from Step 1 through Step 11.
After completing each step, print: '=== Step N complete ===' before continuing.
```

