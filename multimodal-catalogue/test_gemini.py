from dotenv import load_dotenv
load_dotenv()

from backend.services.llm import llm_service
from PIL import Image

# Create a small blank image
img = Image.new('RGB', (100, 100), color = 'red')

print("Generating description...")
desc = llm_service.generate_description(img, seed_keywords=["red", "square"])
print("Description:", desc)

print("Extracting attributes...")
attrs = llm_service.extract_attributes(img)
print("Attributes:", attrs)
