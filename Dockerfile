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
RUN chown user:user /app

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

# Container health check. Polls the lightweight /health endpoint (no AI stack) so
# the orchestrator can tell when the app is actually serving. The long start
# period covers first-run model initialization on boot. Uses Python because the
# slim image has no curl/wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
  CMD python -c "import urllib.request,os; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','7860')+'/health', timeout=4)" || exit 1

# Start the FastAPI backend
CMD uvicorn backend.main:app --host 0.0.0.0 --port $PORT
