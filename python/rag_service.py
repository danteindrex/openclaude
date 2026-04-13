import os
from typing import List, Dict, Any

from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

class RAGService:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        # Efficient small embeddings for local test
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True
        )

    def ingest_text(self, text: str, source: str = "manual"):
        """Ingests raw text into Chroma."""
        # Wrap text in dummy document structure
        documents = [{"page_content": text, "metadata": {"source": source}}]
        
        # Split texts
        chunks = self.text_splitter.create_documents(
            texts=[text], 
            metadatas=[{"source": source}]
        )
        
        if chunks:
            self.vector_store.add_documents(chunks)
            
        return len(chunks)

    def get_context(self, query: str, k: int = 3) -> str:
        """Retrieves top k chunks for context."""
        docs = self.vector_store.similarity_search(query, k=k)
        context = "\n\n".join([doc.page_content for doc in docs])
        return context

# Singleton instance
rag_service = RAGService()
