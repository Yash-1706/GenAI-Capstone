import chromadb
from chromadb.config import Settings
import uuid

chroma_client = chromadb.PersistentClient(path="./chroma_db")

text_collection = chroma_client.get_or_create_collection(
    name="text_embeddings",
    metadata={"hnsw:space": "cosine"}
)

image_collection = chroma_client.get_or_create_collection(
    name="image_embeddings",
    metadata={"hnsw:space": "cosine"}
)

class RetrieverService:
    @staticmethod
    def upsert_product(product_id: str, text_emb: list, image_emb: list, metadata: dict):
        text_collection.upsert(
            documents=[""], # Optional
            ids=[str(product_id)],
            embeddings=[text_emb],
            metadatas=[metadata]
        )
        
        image_collection.upsert(
            documents=[""],
            ids=[str(product_id)],
            embeddings=[image_emb],
            metadatas=[metadata]
        )
        
    @staticmethod
    def get_image_embedding_by_id(product_id: str) -> list:
        res = image_collection.get(ids=[str(product_id)], include=["embeddings"])
        if res and res["embeddings"] and len(res["embeddings"]) > 0:
            return res["embeddings"][0]
        return None

    @staticmethod
    def search_by_text(query_emb: list, top_k: int, filters: dict = None) -> list:
        results = text_collection.query(
            query_embeddings=[query_emb],
            n_results=top_k,
            where=filters if filters else None,
            include=["metadatas", "distances"]
        )
        return RetrieverService._format_results(results)

    @staticmethod
    def search_by_image(image_emb: list, top_k: int) -> list:
        results = image_collection.query(
            query_embeddings=[image_emb],
            n_results=top_k,
            include=["metadatas", "distances"]
        )
        return RetrieverService._format_results(results)

    @staticmethod
    def search_combined(combined_emb: list, top_k: int) -> list:
        # The combined query runs against the image embedding space 
        # (since we projected text to 512-dim logic)
        results = image_collection.query(
            query_embeddings=[combined_emb],
            n_results=top_k,
            include=["metadatas", "distances"]
        )
        return RetrieverService._format_results(results)

    @staticmethod
    def _format_results(raw_results: dict) -> list:
        if not raw_results["ids"] or not raw_results["ids"][0]:
            return []
            
        formatted = []
        for i in range(len(raw_results["ids"][0])):
            formatted.append({
                "product_id": raw_results["ids"][0][i],
                "metadata": raw_results["metadatas"][0][i],
                "distance": raw_results["distances"][0][i]
                # Note: distance is cosine distance; score is 1 - distance
            })
            
        # Sort by distance asc (which is highest score)
        formatted.sort(key=lambda x: x["distance"])
        return formatted

retriever = RetrieverService()
