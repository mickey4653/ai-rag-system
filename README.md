# AI RAG System — AI Operating System

A full-stack AI platform built as a browser-based desktop OS. Upload documents, query them with AI, run automations, and manage everything from a drag-and-drop desktop interface.

## Architecture

```
React Desktop UI (ai-rag-chat-ui)
        ↓
FastAPI Backend (app.py)
        ↓
AI Router (router.py)
    ├── RAG — Pinecone + LangChain
    ├── Agent — Tool-based reasoning
    ├── Chat History — SQLite
    └── n8n — Workflow automation
```

## Stack

- **FastAPI** — backend API
- **LangChain** — document loading, embeddings, agent reasoning
- **Pinecone** — vector database
- **OpenAI** — embeddings (`text-embedding-3-small`) and chat (`gpt-4o-mini`)
- **SQLite** — persistence (chat history, documents, workflow logs)
- **n8n** — workflow automation
- **React** — desktop OS UI with draggable windows

## Project Structure

```
ai-rag-system/
├── app.py              # FastAPI app — all endpoints
├── router.py           # AI Router — intent detection and routing
├── agent.py            # AI Agent — tool-based reasoning
├── ingest.py           # Document ingestion pipeline
├── query.py            # RAG query against Pinecone
├── database.py         # SQLite persistence layer
├── main.py             # Standalone prototype script
├── load_data.py        # Utility script
├── sample.txt          # Sample document
├── data.db             # SQLite database (auto-created)
├── uploads/            # Uploaded documents (gitignored)
└── ai-rag-chat-ui/     # React desktop OS UI
    └── src/
        ├── App.js
        ├── apps/
        │   ├── ChatApp.js        # AI chat with history
        │   ├── FileManagerApp.js # Upload + document list
        │   ├── WorkflowApp.js    # Run RAG/agent workflows
        │   └── HistoryApp.js     # Browse chat/doc/workflow logs
        └── components/
            ├── Desktop.js        # Desktop with app icons
            ├── Window.js         # Draggable windows
            ├── Taskbar.js        # Bottom taskbar
            └── ToastContext.js   # Toast notifications
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and ingest a document |
| POST | `/ingest-path` | Ingest a document already on disk |
| GET | `/chat` | AI Router — smart intent-based response |
| GET | `/ask` | Direct RAG query |
| GET | `/agent` | AI agent with tool reasoning |
| GET | `/history/chat` | Chat history |
| GET | `/history/documents` | Uploaded documents |
| GET | `/history/workflows` | Workflow logs |

## AI Router Intents

The `/chat` endpoint automatically detects intent and routes accordingly:

| Intent | Trigger example | Action |
|--------|----------------|--------|
| `KNOWLEDGE_BASE` | "What are Michael's skills?" | RAG query |
| `SUMMARIZE` | "Summarize the document" | RAG + summarization |
| `CHAT_HISTORY` | "What did I ask before?" | SQLite history lookup |
| `LIST_DOCUMENTS` | "List my uploaded files" | SQLite documents query |
| `N8N_WORKFLOW` | "Run the ask workflow" | n8n webhook trigger |
| `GENERAL` | Anything else | Direct LLM response |

## Desktop Apps

| App | Description |
|-----|-------------|
| 💬 AI Chat | Chat with the AI router, loads previous history |
| 📂 File Manager | Upload documents, view ingested files |
| ⚙️ Workflows | Run RAG or agent queries directly |
| 🕓 History | Browse chat, document, and workflow logs |

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

### 3. Start FastAPI

```bash
uvicorn app:app --reload
```

### 4. Start n8n

```bash
n8n start
```

### 5. Start the React desktop UI

```bash
cd ai-rag-chat-ui
npm install
npm start
```

Open `http://localhost:3000`

## Supported File Types

`.pdf` `.txt` `.docx`
