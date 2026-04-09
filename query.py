from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
import os
from dotenv import load_dotenv

load_dotenv()

def ask_question(query, index_name="ai-rag-system", top_k=3):
    # Embeddings (must match what was used during ingestion)
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=1024)

    # Connect to existing Pinecone index
    vectorstore = PineconeVectorStore(
        index_name=index_name,
        embedding=embeddings,
        pinecone_api_key=os.getenv("PINECONE_API_KEY")
    )

    # Retrieve relevant chunks
    results = vectorstore.similarity_search(query, k=top_k)

    # Combine context
    context = "\n".join([r.page_content for r in results])

    # AI answer
    llm = ChatOpenAI()
    prompt = f"""Answer the question based on the context below:

Context:
{context}

Question: {query}
"""
    response = llm.invoke(prompt)
    return response.content

# Test query
if __name__ == "__main__":
    answer = ask_question("What is Pinecone used for?")
    print(answer)
