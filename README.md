# AI RAG System

A Retrieval-Augmented Generation (RAG) system that lets you upload documents and ask questions against them using AI. Built with FastAPI, LangChain, Pinecone, n8n, and a React chat UI.

## How It Works

```
Document uploaded → Ingested into Pinecone → User asks question → AI agent retrieves context → Answer returned
```

## Stack

- **FastAPI** — backend API
- **LangChain** — document loading, text splitting, embeddings, agent reasoning
- **Pinecone** — vector database for storing and retrieving embeddings
- **OpenAI** — embeddings (`text-embedding-3-small`) and chat (`gpt-3.5-turbo`)
- **n8n** — workflow automation (auto-ingest on file drop, webhook-based Q&A)
- **React** — chat UI with file upload and source attribution

## Project Structure

```
ai-rag-system/
├── app.py              # FastAPI app with all endpoints
├── agent.py            # AI agent with tool-based reasoning
├── ingest.py           # Document loading and Pinecone ingestion
├── query.py            # RAG query against Pinecone
├── main.py             # Standalone script (initial prototype)
├── load_data.py        # Utility script for loading documents
├── sample.txt          # Sample document for testing
├── ai-rag-chat-ui/     # React chat interface
└── uploads/            # Uploaded documents (gitignored)
```

## Setup

### 1. Install Python dependencies

```bash
pip install fastapi uvicorn langchain langchain-community langchain-openai langchain-pinecone langchain-text-splitters pinecone pypdf docx2txt python-dotenv python-multipart requests
```

### 2. Configure environment variables

Create a `.env` file:

```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

### 3. Install and run n8n

```bash
npm install -g n8n
n8n start
```

### 4. Install React dependencies and start UI

```bash
cd ai-rag-chat-ui
npm install
npm start
```

### 5. Start FastAPI

```bash
uvicorn app:app --reload
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and ingest a document |
| POST | `/ingest-path` | Ingest a document already on disk by path |
| GET | `/ask` | Query the knowledge base directly |
| GET | `/agent` | Query via AI agent with tool reasoning |

## n8n Workflows

### Upload Workflow
```
Local File Trigger (watches /uploads) → HTTP Request (POST /ingest-path)
```

### Ask Workflow
```
Webhook (GET /webhook/ask?q=...) → HTTP Request (GET /ask) → Respond to Webhook
```

## Supported File Types

- `.pdf`
- `.txt`
- `.docx`
