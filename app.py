from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from ingest import ingest_document
from agent import run_agent
from query import ask_question
from router import route
from database import init_db, save_chat, get_chat_history, save_document, get_documents, save_workflow_log, get_workflow_logs

app = FastAPI(title="AI Knowledge Base API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
init_db()

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=400,
            content={"error": f"File type '{ext}' not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"}
        )

    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        ingest_document(file_location)
        save_document(file.filename, file_location)
    except Exception as e:
        os.remove(file_location)
        return JSONResponse(status_code=500, content={"error": f"Ingestion failed: {str(e)}"})

    return {"message": f"File '{file.filename}' uploaded and ingested."}

@app.post("/ingest-path")
def ingest_path(path: str):
    ingest_document(path)
    return {"message": f"File '{path}' ingested."}

@app.get("/chat")
def chat(q: str):
    answer = route(q)
    save_chat(q, answer)
    return {"question": q, "answer": answer}

@app.get("/ask")
def ask(q: str):
    answer = ask_question(q)
    save_chat(q, answer)
    save_workflow_log("ask", q, answer)
    return {"question": q, "answer": answer}

@app.get("/agent")
def agent_query(q: str):
    answer = run_agent(q)
    save_chat(q, answer)
    save_workflow_log("agent", q, answer)
    return {"question": q, "answer": answer}

@app.get("/history/chat")
def chat_history():
    return get_chat_history()

@app.get("/history/documents")
def documents():
    return get_documents()

@app.get("/history/workflows")
def workflow_logs():
    return get_workflow_logs()
