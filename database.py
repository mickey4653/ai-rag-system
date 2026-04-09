import sqlite3
import os
from datetime import datetime

DB_PATH = "data.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workflow_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow TEXT NOT NULL,
            query TEXT,
            result TEXT,
            created_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

def save_chat(question, answer):
    conn = get_conn()
    conn.execute(
        "INSERT INTO chat_history (question, answer, created_at) VALUES (?, ?, ?)",
        (question, answer, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

def get_chat_history(limit=50):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM chat_history ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_document(filename, filepath):
    conn = get_conn()
    conn.execute(
        "INSERT INTO uploaded_docs (filename, filepath, created_at) VALUES (?, ?, ?)",
        (filename, filepath, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

def get_documents():
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM uploaded_docs ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_workflow_log(workflow, query, result):
    conn = get_conn()
    conn.execute(
        "INSERT INTO workflow_logs (workflow, query, result, created_at) VALUES (?, ?, ?, ?)",
        (workflow, query, result, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

def get_workflow_logs(limit=50):
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM workflow_logs ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]
