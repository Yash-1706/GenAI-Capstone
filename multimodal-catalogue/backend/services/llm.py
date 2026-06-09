import anthropic
import os
import json
import base64
from PIL import Image
from io import BytesIO

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if self.api_key:
            self.client = anthropic.Anthropic(api_key=self.api_key)
        else:
            self.client = None

    def _encode_image(self, pil_image: Image.Image) -> str:
        buffered = BytesIO()
        pil_image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def extract_attributes(self, pil_image: Image.Image) -> dict:
        if not self.client:
            return {"colour": "", "style": "", "material": "", "shape": ""}
            
        b64_img = self._encode_image(pil_image)
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=300,
                system="You are a product attribute extractor. Return ONLY valid JSON.",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": b64_img
                                }
                            },
                            {
                                "type": "text",
                                "text": "Analyse this product image. Return a JSON object with exactly four keys: colour, style, material, shape. Each value is a short phrase. Return nothing else - no explanation, no markdown, only the raw JSON object."
                            }
                        ]
                    }
                ]
            )
            raw_content = response.content[0].text
            return json.loads(raw_content)
        except Exception:
            return {"colour": "", "style": "", "material": "", "shape": ""}

    def generate_description(self, pil_image: Image.Image, seed_keywords: list = None) -> str:
        if not self.client:
            return ""
            
        b64_img = self._encode_image(pil_image)
        keywords = ", ".join(seed_keywords) if seed_keywords else "none"
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=300,
                temperature=0.7,
                system="You are an expert e-commerce copywriter.",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": b64_img
                                }
                            },
                            {
                                "type": "text",
                                "text": f"Write a compelling 50-150 word product description for this item. Keywords: {keywords}. Do not invent specs not visible. Return only the description text."
                            }
                        ]
                    }
                ]
            )
            return response.content[0].text.strip()
        except Exception:
            return ""

    def refine_query(self, original_query: str, prior_results_context: str) -> str:
        if not self.client:
            return original_query
            
        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=100,
                system="You refine user queries contextually.",
                messages=[
                    {
                        "role": "user",
                        "content": f"Prior context: {prior_results_context}\nUser said: {original_query}\nCreate a clear expanded search query."
                    }
                ]
            )
            return response.content[0].text.strip()
        except:
            return original_query

llm_service = LLMService()
