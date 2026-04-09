from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from query import ask_question
import requests
from dotenv import load_dotenv

load_dotenv()

# Tool 2 — n8n Automation
def trigger_n8n(question):
    url = "http://localhost:5678/webhook/ask"
    response = requests.get(url, params={"q": question})
    return response.text

llm = ChatOpenAI(temperature=0)

def run_agent(user_input):
    # Step 1 — ask the LLM which tool to use
    system = SystemMessage(content="""You are an AI assistant with access to two tools:
1. KnowledgeBase — answers questions from stored documents
2. AutomationTool — triggers automated workflows

Decide which tool to use and respond with ONLY one of:
USE_KNOWLEDGE_BASE
USE_AUTOMATION_TOOL""")

    decision = llm.invoke([system, HumanMessage(content=user_input)])
    choice = decision.content.strip()

    print(f"[Agent] Decision: {choice}")

    # Step 2 — call the chosen tool
    if "AUTOMATION" in choice:
        print("[Agent] Using AutomationTool...")
        result = trigger_n8n(user_input)
    else:
        print("[Agent] Using KnowledgeBase...")
        result = ask_question(user_input)

    # Step 3 — return final answer
    print(f"[Agent] Answer: {result}")
    return result

if __name__ == "__main__":
    run_agent("What are the skills listed in the document?")
