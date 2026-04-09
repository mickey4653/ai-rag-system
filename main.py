from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from pinecone import Pinecone as PineconeClient
import os
from dotenv import load_dotenv

load_dotenv()

# Load document
loader = TextLoader("sample.txt")
documents = loader.load()

# Split text
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
docs = text_splitter.split_documents(documents)

# Embeddings
embeddings = OpenAIEmbeddings(model="text-embedding-3-small", dimensions=1024)

# Pinecone setup
pc = PineconeClient(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "ai-rag-system"

# Create index if not exists
if index_name not in [i.name for i in pc.list_indexes()]:
    pc.create_index(
        name=index_name,
        dimension=1024,
        metric="cosine"
    )

index = pc.Index(index_name)

# Store documents
vectorstore = PineconeVectorStore.from_documents(docs, embeddings, index_name=index_name, pinecone_api_key=os.getenv("PINECONE_API_KEY"))

# Query
query = "What is this document about?"
results = vectorstore.similarity_search(query, k=3)

# AI response
llm = ChatOpenAI()

context = "\n".join([r.page_content for r in results])

response = llm.invoke(f"""
Answer based on context:

{context}

Question: {query}
""")

print(response.content)