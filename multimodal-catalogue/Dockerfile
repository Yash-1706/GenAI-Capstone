FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for compiling packages like chromadb
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Optimize size: Install CPU-only PyTorch (saves ~2GB of space)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy requirements file and install dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code and seed database files
COPY . .

# Set PYTHONPATH so python can resolve 'backend' imports properly
ENV PYTHONPATH=/app

# Pre-download and cache transformer model weights during build to prevent timeout on startup
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
RUN python -c "from transformers import CLIPModel, CLIPProcessor; CLIPModel.from_pretrained('openai/clip-vit-base-patch32'); CLIPProcessor.from_pretrained('openai/clip-vit-base-patch32')"
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')"

# Expose port 8000 for FastAPI
EXPOSE 8000

# Container health check. Polls the lightweight /health endpoint (no AI stack) so
# the orchestrator can tell when the app is actually serving. The long start
# period covers first-run model initialization on boot. Uses Python because the
# slim image has no curl/wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=4)" || exit 1

# Start command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
