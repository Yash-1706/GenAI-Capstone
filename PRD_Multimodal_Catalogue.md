Assignment #8 — Multimodal Product Catalogue Intelligence 

## **Product Requirements Document** 

Multimodal Product Catalogue Intelligence 

Assignment: **#8 of 15** Category: **Multimodal** Team Size: **5 Students** Marks: **15 + 3 Bonus** Version: **1.0** 

## **1. Executive Summary** 

Search abandonment is direct revenue loss. When customers cannot find a product, they leave — immediately. This system solves that by letting customers search the way they naturally think: with words, with photos, or with both. The Multimodal Product Catalogue Intelligence platform combines semantic text search, image embedding similarity, combined multimodal retrieval, automatic attribute extraction, AIgenerated product descriptions, and real-time analytics into one cohesive system. 

## **2. Problem Statement** 

Keyword-based catalogue search has three systematic failure modes: 

- Vocabulary mismatch — the customer says 'navy settee', the catalogue says 'dark blue sofa' 

- No visual channel — customers who spot a product in the real world cannot search by appearance 

- Data gaps — items with missing or poor descriptions return zero results, costing sales 

Each failure mode translates to measurable search abandonment and lost revenue. 

## **3. Goals & Non-Goals** 

## **3.1 Goals** 

- Semantic text search that understands natural language intent, not just keywords 

- Image-based search: upload a photo, find the closest catalogue match 

- Combined multimodal search using both image and text for highest precision 

- Automatic extraction of product attributes (colour, style, material, shape) from images 

- AI-generated product descriptions for items with missing or poor copy 

- Search analytics tracking abandonment, zero-result queries, and click-through rates 

## **3.2 Non-Goals** 

- Real-time inventory management or pricing 

- Payment processing or checkout flows 

- Multi-language localisation (v1 is English-only) 

- Native mobile app (web-first, mobile-responsive) 

- Integration with ERP or warehouse management systems 

## **4. Users & Personas** 

|**Persona**|**Description**|**Primary Need**|
|---|---|---|
|End Customer|Shopping with intent; may have a<br>photo of a product they like.|Find the right product quickly with<br>minimal typing|
|Catalogue Manager|Internal team maintaining product<br>data and copy.|Auto-generate descriptions, bulk-tag<br>attributes, surface gaps|
|Data Analyst|Reviews search performance and<br>catalogue health.|Analytics dashboard and gap reports|



## **5. Features & Functional Requirements** 

## **5.1 Text Search** 

- FR-T1: Encode queries and catalogue descriptions using a sentence-embedding model 

- FR-T2: Return top-N results ranked by cosine similarity 

- FR-T3: Support attribute filters (colour, category, price range) applied post-retrieval 

- FR-T4: Support conversational refinement ('show me the same but in red') 

- FR-T5: Log zero-result queries to the analytics pipeline 

## **5.2 Image Search** 

- FR-I1: Accept JPG, PNG, WEBP uploads up to 10 MB 

- FR-I2: Extract visual embeddings using a CLIP-family model 

- FR-I3: Match against a pre-built index of catalogue image embeddings 

- FR-I4: Return top-N ranked results with similarity scores 

- FR-I5: Handle partial images (e.g. cropped product in a lifestyle photo) 

## **5.3 Combined Multimodal Search** 

- FR-M1: Accept simultaneous image upload and text input 

- FR-M2: Fuse visual and semantic embedding vectors (weighted sum, configurable alpha) 

- FR-M3: Combined results demonstrably outperform text-only or image-only on ambiguous test cases 

- FR-M4: Fusion weight is configurable at runtime without code changes 

## **5.4 Attribute Extraction** 

- FR-A1: Extract at minimum: colour, style, material type, shape 

- FR-A2: Store attributes as filterable tags on each catalogue entry 

- FR-A3: Extraction runs at ingestion time and on-demand for new products 

- FR-A4: Extraction accuracy ≥ 80% across all four attributes on the test image set 

## **5.5 AI Product Descriptions** 

- FR-D1: Accept a product image and optional seed keywords 

- FR-D2: Generate 50–150 word descriptions suitable for e-commerce copy 

- FR-D3: Descriptions are editable by catalogue managers before publishing 

- FR-D4: Trigger automatically for items missing descriptions during ingestion 

## **5.6 Search Analytics** 

- FR-S1: Log every search query, including modality (text / image / combined) 

- FR-S2: Track abandonment events (search with no subsequent product click) 

- FR-S3: Cluster zero-result queries and surface as catalogue gap reports 

- FR-S4: Report click-through rate per query and per product 

- FR-S5: Analytics dashboard accessible to authenticated internal users only 

## **6. Success Metrics** 

|**Metric**|**Target**|**How Measured**|
|---|---|---|
|Text search relevance<br>(MRR@5)|≥ 0.75|Manual relevance judgements on 50-query<br>test set|
|Image search top-5 accuracy|≥ 70%|Labelled test image set|
|Combined vs single-modal<br>improvement|> 0 MRR pts|A/B on ambiguous test queries|
|Attribute extraction accuracy|≥ 80%|Human-labelled attribute ground truth|
|Description usefulness (5-pt<br>scale)|≥ 3.5 avg|Peer evaluation rubric|



## **7. Assumptions & Constraints** 

- Catalogue size: 500–5,000 products for the demo; full re-index must complete in < 10 minutes 

- Deployment: local development server; optional cloud demo link 

- External AI APIs are permitted (Anthropic, Hugging Face Inference) 

- Open-source embedding models preferred to minimise per-query API costs 

- Group of 5 students; timeline aligned with course submission deadline 

## **8. Out of Scope (v1)** 

- Real-time sync with a live e-commerce platform 

- Fine-tuning embedding models on domain-specific catalogue data 

- A/B testing infrastructure for ranking algorithm variants 

- End-customer authentication (analytics dashboard auth only) 

