Assignment #8 — Multimodal Product Catalogue Intelligence 

## **Technical Requirements Document** 

Multimodal Product Catalogue Intelligence 

Assignment: **#8 of 15** Stack: **Python · FastAPI · React · CLIP · Claude API** Version: **1.0** 

## **1. System Architecture** 

Three-tier web application: React frontend, Python/FastAPI backend, ChromaDB vector store. All AI inference is handled server-side. 

|**Layer**|**Technology**|**Responsibility**|
|---|---|---|
|Frontend|React 18 · Vite · TypeScript ·<br>Tailwind CSS|Search UI, image upload, results<br>display, analytics dashboard|
|Backend API|Python 3.11 · FastAPI · Uvicorn|Request routing, embedding inference,<br>retrieval, description generation|
|Vector Store|ChromaDB (local persistent)|Stores and queries image & text<br>embeddings|
|Embedding Model|openai/clip-vit-base-patch32<br>(HuggingFace)|Unified visual-semantic embedding<br>space (512-dim)|
|Text Encoder|sentence-transformers/all-MiniLM-<br>L6-v2|Text query embedding (384-dim)|
|Re-ranker|cross-encoder/ms-marco-MiniLM-<br>L-6-v2|Re-ranks top-50 text results to final top-<br>N|
|LLM|Claude claude-sonnet-4-<br>20250514 (Anthropic API)|Attribute extraction, description<br>generation, query refinement|
|Analytics DB|SQLite / SQLAlchemy async|Stores search events, clicks, session<br>data|



## **2. Data Models** 

## **2.1 Product Table** 

|**Field**|**Type**|**Nullable**|**Notes**|
|---|---|---|---|
|id|UUID|No|Primary key|
|sku|VARCHAR(64)|No|Unique catalogue identifier|
|name|TEXT|No|Product display name|
|description|TEXT|Yes|Human or AI-generated<br>copy|
|category|VARCHAR(128)|No|Top-level category|



|price|DECIMAL(10,2)|No|Base price|
|---|---|---|---|
|image_urls|JSON array|No|One or more image URLs|
|attributes|JSONB|Yes|Extracted: colour, style,<br>material, shape|
|ai_generated|BOOLEAN|No|True if description is AI-<br>authored|
|text_embedding_id|VARCHAR(64)|Yes|FK → ChromaDB text<br>collection|
|image_embedding_id|VARCHAR(64)|Yes|FK → ChromaDB image<br>collection|
|created_at|TIMESTAMP|No|Auto-set on insert|
|updated_at|TIMESTAMP|No|Auto-set on change|



## **2.2 SearchEvent Table** 

|**Field**|**Type**|**Nullable**|**Notes**|
|---|---|---|---|
|id|UUID|No|Primary key|
|session_id|VARCHAR(64)|No|Anonymous session token|
|modality|ENUM|No|text | image | combined|
|query_text|TEXT|Yes|Raw text query|
|query_image_hash|VARCHAR(64)|Yes|SHA-256 of uploaded<br>image bytes|
|result_count|INT|No|Number of results returned|
|clicked_product_id|UUID|Yes|NULL if abandoned|
|abandoned|BOOLEAN|No|True if no click within<br>timeout window|
|latency_ms|INT|No|End-to-end API response<br>time|
|created_at|TIMESTAMP|No|Auto-set|



## **3. API Specification** 

**Verb Path Request Response** 

|POS<br>T|/api/search/text|{ query, filters, top_k }|SearchResult[] + event_id|
|---|---|---|---|
|POS<br>T|/api/search/image|multipart: image, top_k|SearchResult[] + event_id|
|POS<br>T|/api/search/combined|multipart: image, query,<br>fusion_weight, top_k|SearchResult[] + event_id|
|GET|/api/products/{id}|—|Product|
|POS<br>T|/api/products/{id}/describe|{ seed_keywords }|{ description }|
|POS<br>T|/api/products/{id}/extract-<br>attributes|—|{ attributes }|
|POS<br>T|/api/analytics/click|{ event_id, product_id }|204 No Content|
|GET|/api/analytics/summary|?from=&to=|AnalyticsSummary|
|GET|/api/analytics/gaps|—|GapReport[]|



## **4. Embedding & Retrieval Pipelines** 

## **4.1 Text Search** 

- Encode query with sentence-transformers/all-MiniLM-L6-v2 → 384-dim L2-normalised vector 

- Query ChromaDB 'text_embeddings' collection with cosine distance 

- Apply metadata filters post-retrieval (colour, category, price range) 

- Re-rank top-50 candidates with cross-encoder/ms-marco-MiniLM-L-6-v2 → return top-N 

## **4.2 Image Search** 

- Encode uploaded image with openai/clip-vit-base-patch32 → 512-dim L2-normalised vector 

- Query ChromaDB 'image_embeddings' collection with cosine distance 

- Merge & deduplicate if a product has multiple catalogue images 

- Return top-N with similarity scores [0, 1] 

## **4.3 Combined Multimodal Search** 

- Compute text embedding (384-dim) → project to 512-dim shared space via stored linear map 

- Compute image embedding (512-dim) 

- Fuse: combined = α × image_emb + (1-α) × text_emb, default α = 0.6 

- Query unified 'image_embeddings' collection; alpha configurable per-request via fusion_weight param 

- Fusion weight also stored in backend/config.yaml; no code deploy needed to change default 

## **4.4 Catalogue Ingestion** 

- Run: python ingest.py --catalogue data/products.json 

- For each product: load image → CLIP encode → upsert to image_embeddings with metadata 

- For each product: concatenate name + description → sentence-transformer encode → upsert to text_embeddings 

- Run attribute extraction in batches of 20 via LLM; store results in SQLite 

- Full re-index target: < 10 minutes for 5,000 products on commodity hardware 

## **5. LLM Prompt Design** 

## **5.1 Attribute Extraction Prompt** 

```
SYSTEM: You are a product attribute extractor. Return ONLY valid JSON.
```

```
USER: Analyse this product image. Return a JSON object with exactly
      four keys: colour, style, material, shape. Each value must be a
      single descriptive word or short phrase. Return nothing else —
      no explanation, no markdown, only the raw JSON object.
```

```
EXPECTED OUTPUT:
{ "colour": "navy blue", "style": "mid-century modern",
  "material": "solid wood", "shape": "rectangular" }
```

## **5.2 Description Generation Prompt** 

```
SYSTEM: You are an expert e-commerce copywriter.
```

```
USER: Write a compelling 50-150 word product description for this item.
      Keywords to incorporate: {seed_keywords}.
      Do not invent specifications not visible in the image.
      Return only the description text — no title, no markdown.
```

```
PARAMETERS: temperature=0.7, max_tokens=300
```

## **6. Analytics Implementation** 

- Every search API response includes a search_event_id UUID for click tracking 

- Frontend fires POST /api/analytics/click within 30 s of viewing results 

- Abandonment detected server-side: event older than 300 s with no click → abandoned=True 

- Background task (every 15 min) clusters zero-result queries by embedding similarity → gap_reports table 

- Dashboard aggregates: CTR by modality, daily query volume, top abandoned terms, zero-result rate 

## **7. Frontend Component Map** 

|**Component**|**Route**|**Description**|
|---|---|---|
|SearchPage|/|Text box, image upload zone, modality<br>toggle, fusion weight slider, attribute filter<br>sidebar|
|ResultsGrid|/results|Responsive 3-col grid of ProductCard<br>components with score badges|
|ProductDetail|/product/:id|Full product view, Generate Description<br>button, Extract Attributes button, similar<br>products|
|DescriptionEditor|/product/:id/edit|Inline editor for catalogue managers to<br>review and publish AI copy|
|AnalyticsDashboard|/analytics|Line chart (daily volume), bar chart (CTR by<br>modality), stat cards, gap table|
|AttributePanel|Sidebar|Filterable attribute chips rendered from<br>ChromaDB metadata facets|



## **8. Non-Functional Requirements** 

|**Category**|**Requirement**|**Acceptance Test**|
|---|---|---|
|Performance|p95 text search latency < 500 ms|k6 load test: 20 VU, 60 s|
|Performance|p95 image search latency < 2,000 ms|k6 load test: 5 VU, 60 s|
|Scalability|Support 5,000 catalogue products|Full ingest without OOM or timeout|
|Reliability|99% uptime during 2-hour demo<br>window|Manual availability check every 10 min|
|Security|Analytics dashboard requires auth<br>token|Unauthenticated GET /api/analytics<br>returns 401|
|Accessibility|WCAG 2.1 AA for search UI|axe-core scan: 0 critical violations|



## **9. Development Milestones** 

|**Sprint**|**Deliverable**|**Owner**|
|---|---|---|
|Sprint 1|Catalogue ingestion + CLIP embeddings +<br>ChromaDB setup|Backend Lead|
|Sprint 2|Text search API + React search UI + results grid|Backend + Frontend|
|Sprint 3|Image search API + image upload component +<br>combined search|Backend + Frontend|
|Sprint 4|Attribute extraction + description generation +<br>product detail page|AI/ML Lead|
|Sprint 5|Analytics pipeline + dashboard + performance<br>testing + demo prep|Full Team|



## **10. Directory Structure** 

```
multimodal-catalogue/
├── backend/
```

- `│   ├── main.py                 # FastAPI app entry point + CORS + startup` 

- `│   ├── config.yaml             # Model names, fusion weights, thresholds │   ├── routers/` 

- `│   │   ├── search.py           # /api/search/text|image|combined` 

- `│   │   ├── products.py         # /api/products/*` 

- `│   │   └── analytics.py        # /api/analytics/*` 

- `│   ├── services/` 

- `│   │   ├── embedder.py         # CLIP + sentence-transformer + fusion` 

- `│   │   ├── retriever.py        # ChromaDB upsert + query helpers` 

- `│   │   ├── llm.py              # Claude API: attribute extract + describe` 

- `│   │   └── analytics_svc.py    # SearchEvent logging + gap clustering │   ├── models/` 

- `│   │   └── schemas.py          # All Pydantic v2 request/response models │   ├── db/` 

- `│   │   └── database.py         # Async SQLAlchemy engine + ORM models` 

- `│   └── ingest.py               # CLI ingestion script ├── frontend/` 

- `│   ├── src/` 

- `│   │   ├── pages/              # SearchPage, ResultsGrid, ProductDetail,` 

- `│   │   │                       # DescriptionEditor, AnalyticsDashboard` 

- `│   │   ├── components/         # ProductCard, AttributePanel, SearchBar,` 

- `│   │   │                       # ImageUpload, FusionSlider, StatCard` 

- `│   │   ├── api/                # Typed Axios client for all endpoints` 

- `│   │   └── store/              # Zustand stores: search, session, analytics` 

- `│   └── vite.config.ts` 

```
├── data/
```

- `│   └── products.json           # 20-product sample catalogue` 

```
├── tests/
```

- `│   ├── test_search.py │   └── test_attributes.py ├── .env.example └── README.md` 

