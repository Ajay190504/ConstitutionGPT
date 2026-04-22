import os
from typing import List, Dict

class RAGService:
    _collection = None
    _embedding_function = None
    _initialized_chroma = False

    @classmethod
    def get_collection(cls):
        if cls._collection:
            return cls._collection
            
        try:
            import chromadb
            
            # Initialize persistent client
            db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
            client = chromadb.PersistentClient(path=db_path)
            
            # Using the default lightweight embedding function provided by ChromaDB
            from chromadb.utils import embedding_functions
            cls._embedding_function = embedding_functions.DefaultEmbeddingFunction()
            
            cls._collection = client.get_or_create_collection(
                name="indian_constitution_v3",
                embedding_function=cls._embedding_function
            )
            cls._initialized_chroma = True
            print("SUCCESS: ChromaDB initialized successfully.")
            return cls._collection
        except ImportError:
            print("WARNING: 'chromadb' package missing. falling back to keyword search.")
            return None
        except Exception as e:
            print(f"ERROR: Error initializing ChromaDB: {e}")
            return None

    @classmethod
    def add_documents(cls, documents: List[Dict[str, str]]):
        """
        Expects a list of dicts with 'content' and 'metadata'.
        """
        collection = cls.get_collection()
        if not collection:
            return
        
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            
            ids = []
            texts = []
            metadatas = []
            
            for i, doc in enumerate(documents):
                chunks = text_splitter.split_text(doc["content"])
                for j, chunk in enumerate(chunks):
                    ids.append(f"doc_{i}_chunk_{j}")
                    texts.append(chunk)
                    metadatas.append(doc.get("metadata", {}))
            
            collection.add(
                ids=ids,
                documents=texts,
                metadatas=metadatas
            )
        except Exception as e:
            print(f"Failed to add documents to Chroma: {e}")

    @classmethod
    def query(cls, query_text: str, n_results: int = 3) -> List[str]:
        # Try vector search first
        collection = cls.get_collection()
        if collection:
            try:
                results = collection.query(
                    query_texts=[query_text],
                    n_results=n_results
                )
                if results and results["documents"] and results["documents"][0]:
                    return results["documents"][0]
            except Exception as e:
                print(f"Chroma query error: {e}")

        # Keyword Fallback using TopicsService (Free/Local)
        try:
            from services.topics_service import TopicsService
            topics = TopicsService.search_topics(query_text)
            if topics:
                return [f"{t['title']}: {t['content']}" for t in topics[:n_results]]
        except Exception as e:
            print(f"Fallback search error: {e}")
            
        return []

    @classmethod
    def initialize_with_topics(cls):
        """Seed the vector DB with constitutional data if empty."""
        collection = cls.get_collection()
        if not collection:
            return

        try:
            from database import topics_collection
            if collection.count() > 0:
                return
            
            print("Seeding RAG database with initial data...")
            
            # 1. Seed from MongoDB topics
            topics = list(topics_collection.find({}))
            docs_to_add = [
                {
                    "content": f"{t['title']}: {t['content']}",
                    "metadata": {"title": t["title"], "source": "default_topics"}
                }
                for t in topics
            ]
            
            if docs_to_add:
                cls.add_documents(docs_to_add)
                
            # 2. Automatically try to ingest PDFs if they exist (for production/fresh deploys)
            cls._auto_ingest_pdfs()
            
        except Exception as e:
            print(f"RAG seeding error: {e}")

    @classmethod
    def _auto_ingest_pdfs(cls):
        """Internal helper to ingest PDFs if they are in the constitution_db folder."""
        try:
            from langchain_community.document_loaders import PyPDFLoader
            
            base_path = os.path.join(os.path.dirname(__file__), "..", "constitution_db")
            if not os.path.exists(base_path):
                return
                
            pdfs = ["constitution_eng.pdf", "constitution_hindi.pdf"]
            all_pdf_docs = []
            
            for pdf_name in pdfs:
                path = os.path.join(base_path, pdf_name)
                if os.path.exists(path):
                    print(f"Auto-ingesting {pdf_name}...")
                    loader = PyPDFLoader(path)
                    pages = loader.load()
                    for page in pages:
                        all_pdf_docs.append({
                            "content": page.page_content,
                            "metadata": {"source": pdf_name, "page": page.metadata.get("page", 0)}
                        })
            
            if all_pdf_docs:
                cls.add_documents(all_pdf_docs)
                print(f"Successfully auto-indexed {len(all_pdf_docs)} PDF pages.")
        except Exception as e:
            print(f"RAG auto-ingest warning: {e}")
