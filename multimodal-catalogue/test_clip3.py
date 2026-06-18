import torch
from transformers import CLIPModel, CLIPProcessor
from PIL import Image

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
img = Image.new('RGB', (224, 224), color='red')
inputs = processor(images=img, return_tensors="pt")
out = model.get_image_features(**inputs)

print("Type of out:", type(out))
if isinstance(out, torch.Tensor):
    print("Tensor shape:", out.shape)
else:
    print("out keys:", out.keys() if hasattr(out, 'keys') else "No keys")
    if hasattr(out, 'image_embeds'):
        print("Has image_embeds:", out.image_embeds.shape)
    if hasattr(out, 'pooler_output'):
        print("pooler_output shape:", out.pooler_output.shape)
