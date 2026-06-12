import google.generativeai as genai
import os
import json
from PIL import Image

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def extract_attributes(self, pil_image: Image.Image) -> dict:
        if not self.model:
            return {"colour": "", "style": "", "material": "", "shape": ""}
            
        try:
            prompt = "Analyse this product image. Return a JSON object with exactly four keys: colour, style, material, shape. Each value is a short phrase. Return nothing else - no explanation, no markdown, only the raw JSON object."
            response = self.model.generate_content([prompt, pil_image])
            raw_content = response.text.strip()
            
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
        if not self.model:
            return ""
            
        keywords = ", ".join(seed_keywords) if seed_keywords else "none"
        try:
            prompt = f"You are an expert e-commerce copywriter. Write a compelling 50-150 word product description for this item. Keywords: {keywords}. Do not invent specs not visible. Return only the description text."
            response = self.model.generate_content([prompt, pil_image])
            return response.text.strip()
        except Exception as e:
            print(f"Error generating description: {e}")
            return ""

    def refine_query(self, original_query: str, prior_results_context: str) -> str:
        if not self.model:
            return original_query
            
        try:
            prompt = f"You refine user queries contextually.\nPrior context: {prior_results_context}\nUser said: {original_query}\nCreate a clear expanded search query."
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"Error refining query: {e}")
            return original_query

llm_service = LLMService()
