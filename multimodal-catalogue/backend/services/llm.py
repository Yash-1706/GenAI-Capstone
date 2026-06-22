import os
import json
from PIL import Image
import base64
from io import BytesIO
from openai import OpenAI

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
            self.model = "gpt-4o-mini"
        else:
            self.client = None

    def _encode_image(self, pil_image: Image.Image) -> str:
        buffered = BytesIO()
        pil_image.save(buffered, format="JPEG")
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

    def extract_attributes(self, pil_image: Image.Image) -> dict:
        if not self.client:
            return {"colour": "", "style": "", "material": "", "shape": ""}
            
        try:
            base64_image = self._encode_image(pil_image)
            prompt = "Analyse this product image. Return a JSON object with exactly four keys: colour, style, material, shape. Each value is a short phrase. Return nothing else - no explanation, no markdown, only the raw JSON object."
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=100
            )
            raw_content = response.choices[0].message.content.strip()
            
            # Clean up potential markdown formatting
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:-3].strip()
            elif raw_content.startswith("```"):
                raw_content = raw_content[3:-3].strip()
                
            return json.loads(raw_content)
        except Exception as e:
            print(f"Error extracting attributes: {e}")
            return {"colour": "", "style": "", "material": "", "shape": ""}

    def generate_description(self, pil_image: Image.Image, seed_keywords: list = None) -> str:
        if not self.client:
            return ""
            
        keywords = ", ".join(seed_keywords) if seed_keywords else "none"
        try:
            base64_image = self._encode_image(pil_image)
            prompt = f"You are an expert e-commerce copywriter. Write a compelling 50-150 word product description for this item. Keywords: {keywords}. Do not invent specs not visible. Return only the description text."
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating description: {e}")
            return ""

    def refine_query(self, original_query: str, prior_results_context: str) -> str:
        if not self.client:
            return original_query
            
        try:
            prompt = f"You refine user queries contextually.\nPrior context: {prior_results_context}\nUser said: {original_query}\nCreate a clear expanded search query."
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=100
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error refining query: {e}")
            return original_query

llm_service = LLMService()
