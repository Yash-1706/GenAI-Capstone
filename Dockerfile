# Use Python 3.11 slim image
FROM python:3.11-slim

# Create a non-root user (Required by Hugging Face Spaces)
RUN useradd -m -u 1000 user

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Switch to the non-root user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Copy requirements first to leverage Docker cache
COPY --chown=user multimodal-catalogue/backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend and project files
COPY --chown=user multimodal-catalogue/ /app/

# Port 7860 is required by Hugging Face Spaces (Render will override this dynamically)
ENV PORT=7860
EXPOSE $PORT

# Start the FastAPI backend
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
