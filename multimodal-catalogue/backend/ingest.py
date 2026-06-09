import argparse
import json
import asyncio
from PIL import Image
import requests
from io import BytesIO
from backend.db.database import AsyncSessionLocal, ProductModel, init_db
from backend.services.embedder import embedder
from backend.services.retriever import retriever

async def run_ingestion(catalogue_path: str):
    await init_db()
    with open(catalogue_path, "r") as f:
        products = json.load(f)

    async with AsyncSessionLocal() as session:
        for idx, prod in enumerate(products, 1):
            print(f"[{idx}/{len(products)}] Processing {prod['sku']} - {prod['name']}")
            image_url = prod["image_urls"][0]
            try:
                response = requests.get(image_url, timeout=10)
                image = Image.open(BytesIO(response.content)).convert("RGB")
            except Exception as e:
                print(f" Warning: could not load image for {prod['sku']}, using blank image. Error: {e}")
                image = Image.new("RGB", (400, 400), color=(255,255,255))
            
            # Encode
            text_to_encode = f"{prod['name']} {prod.get('description', '')}"
            text_emb = embedder.encode_text(text_to_encode).tolist()
            image_emb = embedder.encode_image(image).tolist()
            
            # Metadata for ChromaDB
            metadata = {
                "sku": prod["sku"],
                "name": prod["name"],
                "category": prod["category"],
                "price": prod["price"]
            }
            
            # Upsert Vector DB
            retriever.upsert_product(
                product_id=prod["id"],
                text_emb=text_emb,
                image_emb=image_emb,
                metadata=metadata
            )
            
            # Upsert SQLite
            existing = await session.get(ProductModel, prod["id"])
            if existing:
                existing.sku = prod["sku"]
                existing.name = prod["name"]
                existing.description = prod.get("description")
                existing.category = prod["category"]
                existing.price = prod["price"]
                existing.image_urls = prod["image_urls"]
            else:
                new_prod = ProductModel(
                    id=prod["id"],
                    sku=prod["sku"],
                    name=prod["name"],
                    description=prod.get("description"),
                    category=prod["category"],
                    price=prod["price"],
                    image_urls=prod["image_urls"],
                    attributes=None,
                    ai_generated=False,
                    text_embedding_id=prod["id"]
                )
                session.add(new_prod)
        await session.commit()
    print("Ingestion complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--catalogue", required=True, help="Path to products.json")
    args = parser.parse_args()
    asyncio.run(run_ingestion(args.catalogue))
