from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from query import ask_question
from database import get_chat_history, get_documents, save_workflow_log
import requests
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(temperature=0)

INTENT_SYSTEM = """You are an AI router. Given a user message, classify the intent into exactly one of these:

KNOWLEDGE_BASE - user wants to ask a question answered from stored documents
SUMMARIZE - user wants a summary of a document or content
CHAT_HISTORY - user wants to know about previous conversations
LIST_DOCUMENTS - user wants to see uploaded documents
N8N_WORKFLOW - user wants to trigger an automation workflow
GENERAL - general conversation or anything else

Respond with ONLY the intent label, nothing else."""


def detect_intent(user_input):
    response = llm.invoke([
        SystemMessage(content=INTENT_SYSTEM),
        HumanMessage(content=user_input)
    ])
    return response.content.strip()


def handle_summarize(user_input):
    context = ask_question(user_input)
    prompt = f"Summarize the following in a concise paragraph:\n\n{context}"
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content


def handle_chat_history(user_input):
    history = get_chat_history(limit=10)
    if not history:
        return "No chat history found."
    formatted = "\n".join(
        [f"Q: {h['question']}\nA: {h['answer']}" for h in history]
    )
    response = llm.invoke([
        SystemMessage(content="Answer based on this chat history:"),
        HumanMessage(content=f"{formatted}\n\nUser question: {user_input}")
    ])
    return response.content


def handle_list_documents():
    docs = get_documents()
    if not docs:
        return "No documents have been uploaded yet."
    lines = [f"- {d['filename']} (uploaded {d['created_at']})" for d in docs]
    return "Uploaded documents:\n" + "\n".join(lines)


def handle_n8n(user_input):
    try:
        res = requests.get(
            "http://localhost:5678/webhook/ask",
            params={"q": user_input},
            timeout=10
        )
        return res.text
    except Exception as e:
        return f"Failed to trigger workflow: {str(e)}"


def route(user_input):
    intent = detect_intent(user_input)
    print(f"[Router] Intent: {intent}")

    if intent == "KNOWLEDGE_BASE":
        result = ask_question(user_input)
    elif intent == "SUMMARIZE":
        result = handle_summarize(user_input)
    elif intent == "CHAT_HISTORY":
        result = handle_chat_history(user_input)
    elif intent == "LIST_DOCUMENTS":
        result = handle_list_documents()
    elif intent == "N8N_WORKFLOW":
        result = handle_n8n(user_input)
    else:
        response = llm.invoke([HumanMessage(content=user_input)])
        result = response.content

    save_workflow_log(intent, user_input, result)
    return result


if __name__ == "__main__":
    test_inputs = [
        "What are Michael's skills?",
        "Summarize the uploaded document",
        "What did I ask before?",
        "List my uploaded files",
    ]
    for q in test_inputs:
        print(f"\nQ: {q}")
        print(f"A: {route(q)}")
