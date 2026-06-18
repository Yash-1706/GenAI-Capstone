import torch
from transformers import CLIPModel, CLIPProcessor
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
img = Image.new('RGB', (224, 224), color='red')
inputs = processor(images=img, return_tensors="pt")
out = model.get_image_features(**inputs)
print(type(out))
if hasattr(out, 'pooler_output'):
    print("Has pooler_output")
if hasattr(out, 'image_embeds'):
    print("Has image_embeds")
