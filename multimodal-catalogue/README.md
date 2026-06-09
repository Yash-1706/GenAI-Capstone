# Multimodal Product Catalogue Intelligence

A complete system for searching and managing an e-commerce product catalogue using multimodal AI. It allows customers to search using natural language text, images, or a combined query combining both text and image for maximum precision.

## System Architecture

The application is built using a three-tier architecture:
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand
- **Backend API**: Python 3.11, FastAPI, Uvicorn, Pydantic v2
- **Vector DB**: ChromaDB (stores embeddings locally)
- **Analytics Database**: SQLite via SQLAlchemy async

### AI/ML Models
- **Visual-Semantic Embedding**: `openai/clip-vit-base-patch32`
- **Text Encoder**: `sentence-transformers/all-MiniLM-L6-v2`
- **Re-ranker**: `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **LLM**: Anthropic's Claude (`claude-3-5-sonnet-20240620`) for attribute extraction and descriptions

## Prerequisites

- Python 3.11
- Node.js 18+ and npm

## Setup & Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd multimodal-catalogue
```

### 2. Environment Variables
Copy the `.env.example` file to `.env` and configure your Anthropic API Key for the LLM features:
```bash
cp .env.example .env
```
Inside `.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Backend Setup
Create a virtual environment and install dependencies:
```bash
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Unix/MacOS
source venv/bin/activate

pip install -r backend/requirements.txt
```

### 4. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd frontend
npm install
```

## Data Ingestion

Before running the server, you need to ingest the catalogue data to create the vector embeddings and local SQLite database:

```bash
# Ensure you are in the project root and virtual env is activated
python backend/ingest.py --catalogue data/products.json
```
This script will create a `chroma_db` directory containing the vector store and populate the local SQLite database.

## Running the Servers

### Start the Backend
From the project root:
```bash
uvicorn backend.main:app --reload
```
The FastAPI server will be running at `http://127.0.0.1:8000`. You can view the API documentation at `http://127.0.0.1:8000/docs`.

### Start the Frontend
In a new terminal window:
```bash
cd frontend
npm run dev
```
The frontend will typically run at `http://localhost:5173`.

## Running Tests

To verify the installation and the backend APIs, you can run the provided pytest suite:

```bash
# From the project root, with virtual env activated
pytest -v tests/
```

## Contributing

- Please ensure all new endpoints have Pydantic `response_model` definitions.
- Write tests for any new features in the `tests/` directory.
- All database operations should be fully asynchronous.
