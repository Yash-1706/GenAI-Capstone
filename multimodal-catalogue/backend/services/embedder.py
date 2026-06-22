import torch
from sentence_transformers import SentenceTransformer
from transformers import CLIPModel, CLIPProcessor
import numpy as np
from PIL import Image
import os
import yaml

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "../config.yaml")
with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

class EmbedderService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbedderService, cls).__new__(cls)
            cls._instance._init_models()
        return cls._instance

    def _init_models(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Text encoding
        self.text_model = SentenceTransformer(config["text_model"], device=self.device)
        
        # Image encoding (CLIP)
        self.clip_model = CLIPModel.from_pretrained(config["clip_model"]).to(self.device)
        self.clip_processor = CLIPProcessor.from_pretrained(config["clip_model"])
        
        # Projection Matrix for combining Text and Image Embeddings
        _project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        self.projection_path = os.path.join(_project_root, "projection_matrix.npy")
        if os.path.exists(self.projection_path):
            self.projection_matrix = np.load(self.projection_path)
        else:
            # Random projection as a fallback (384 -> 512)
            self.projection_matrix = np.random.randn(384, 512) / np.sqrt(384)
            np.save(self.projection_path, self.projection_matrix)

    def encode_text(self, text: str) -> np.ndarray:
        # Returns (384,)
        emb = self.text_model.encode(text, convert_to_numpy=True)
        return emb / np.linalg.norm(emb)

    def encode_image(self, pil_image: Image.Image) -> np.ndarray:
        # Returns (512,)
        inputs = self.clip_processor(images=pil_image, return_tensors="pt").to(self.device)
        with torch.no_grad():
            img_outputs = self.clip_model.get_image_features(**inputs)
            if hasattr(img_outputs, "pooler_output"):
                img_features = img_outputs.pooler_output
            elif hasattr(img_outputs, "image_embeds"):
                img_features = img_outputs.image_embeds
            elif isinstance(img_outputs, torch.Tensor):
                img_features = img_outputs
            else:
                img_features = img_outputs[0]
        img_features = img_features.cpu().numpy().flatten()
        return img_features / np.linalg.norm(img_features)

    def encode_combined(self, text: str, pil_image: Image.Image, alpha: float = 0.6) -> np.ndarray:
        text_emb = self.encode_text(text)
        img_emb = self.encode_image(pil_image)

        # project text 384 -> 512
        projected_text = text_emb @ self.projection_matrix
        projected_text = projected_text / np.linalg.norm(projected_text)

        combined = alpha * img_emb + (1 - alpha) * projected_text
        return combined / np.linalg.norm(combined)

embedder = EmbedderService()
