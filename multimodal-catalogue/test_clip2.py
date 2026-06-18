import torch
from transformers import CLIPModel, CLIPProcessor
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
img = Image.new('RGB', (224, 224), color='red')
inputs = processor(images=img, return_tensors="pt")
out = model(**inputs)
print("Keys:", out.keys())
print("Has image_embeds:", hasattr(out, 'image_embeds'))
if hasattr(out, 'image_embeds'):
    print("Shape:", out.image_embeds.shape)
