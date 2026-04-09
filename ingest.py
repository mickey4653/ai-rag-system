from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone as PineconeClient, ServerlessSpec
import os
from dotenv import load_dotenv

load_dotenv()

def ingest_document(file_path, index_name="ai-rag-system"):
    # Load document (support txt, pdf, docx)
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith(".docx"):
        loader = Docx2txtLoader(file_path)
    else:
        loader = TextLoader(file_path, encoding="utf-8")
    documents = loader.load()

    # Split into chunks
    text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = text_splitter.split_documents(documents)

    # Embeddings
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=1024)

    # Pinecone setup
    pc = PineconeClient(api_key=os.getenv("PINECONE_API_KEY"))

    # Create index if not exists
    if index_name not in [i.name for i in pc.list_indexes()]:
        pc.create_index(
            name=index_name,
            dimension=1024,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )

    # Store documents
    vectorstore = PineconeVectorStore.from_documents(
        docs,
        embeddings,
        index_name=index_name,
        pinecone_api_key=os.getenv("PINECONE_API_KEY")
    )

    print(f"[✅] Document '{file_path}' ingested successfully!")

# Test ingestion
if __name__ == "__main__":
    ingest_document("sample.txt")
