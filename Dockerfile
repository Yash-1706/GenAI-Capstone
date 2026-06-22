# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for building some Python packages (like hnswlib/sentence-transformers)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY multimodal-catalogue/backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend and project files (excluding frontend via .dockerignore)
COPY multimodal-catalogue/ /app/

# Render provides the PORT environment variable dynamically, default to 8000
ENV PORT=8000
EXPOSE $PORT

# Start the FastAPI backend
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
