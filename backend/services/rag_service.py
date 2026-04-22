import os
import time
from typing import List, Dict

class RAGService:
    _collection = None
    _embedding_function = None
    _initialized_chroma = False

    @classmethod
    def get_collection(cls):
        if cls._collection:
            return cls._collection
            
        embedding_mode = os.getenv("EMBEDDING_MODE", "auto").lower()
        if embedding_mode in ["keyword", "off", "none"]:
            print(f"RAG Mode: {embedding_mode.upper()}. Vector Database bypassed.")
            return None

        try:
            import chromadb
            from chromadb.utils import embedding_functions
            
            # Initialize persistent client
            data_dir = os.getenv("DATA_DIR", ".")
            db_path = os.path.join(data_dir, "chroma_db")
            client = chromadb.PersistentClient(path=db_path)
            
            # Memory Optimization: Use OpenAI Embeddings if possible to save ~200-300MB RAM
            openai_key = os.getenv("OPENAI_API_KEY")

            if (embedding_mode == "openai" or (embedding_mode == "auto" and openai_key)) and openai_key:
                try:
                    print("Attempting to use OpenAI Embeddings (Memory-Efficient Mode)...")
                    cls._embedding_function = embedding_functions.OpenAIEmbeddingFunction(
                        api_key=openai_key,
                        model_name="text-embedding-3-small"
                    )
                    # Test if OpenAI key works
                    cls._embedding_function(["test"])
                    print("OpenAI Embeddings verified.")
                except Exception as e:
                    print(f"OpenAI Embedding failed (Quota reached?): {e}")
                    if embedding_mode == "openai":
                        print("Forced OpenAI mode failed. Falling back to Keyword search.")
                        return None
                    print("Falling back to Keyword Search (Memory Protection)...")
                    return None # Do NOT use local embeddings on Render
            else:
                # Check if we should even try local embeddings
                if os.getenv("ALLOW_LOCAL_EMBEDDINGS", "false").lower() == "true":
                    print("Using Local Embeddings (High Memory Usage!)...")
                    cls._embedding_function = embedding_functions.DefaultEmbeddingFunction()
                else:
                    print("Local embeddings disabled for memory protection. Set ALLOW_LOCAL_EMBEDDINGS=true to enable.")
                    return None
            
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
    def add_documents(cls, documents: List[Dict[str, str]], batch_size: int = 20):
        """
        Expects a list of dicts with 'content' and 'metadata'.
        Processed in small batches to prevent memory spikes.
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
            
            # Process documents one by one to avoid massive list building
            for doc in documents:
                chunks = text_splitter.split_text(doc["content"])
                source = doc.get("metadata", {}).get("source", "unknown")
                
                # Add chunks for this document in small batches
                for i in range(0, len(chunks), batch_size):
                    end = min(i + batch_size, len(chunks))
                    batch_texts = chunks[i:end]
                    batch_ids = [f"{source}_{int(time.time())}_{i+j}" for j in range(len(batch_texts))]
                    batch_metadatas = [doc.get("metadata", {}) for _ in range(len(batch_texts))]
                    
                    collection.add(
                        ids=batch_ids,
                        documents=batch_texts,
                        metadatas=batch_metadatas
                    )
                
                print(f"Indexed {len(chunks)} chunks from {source}")
                
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
        if os.getenv("SKIP_RAG_AUTO_INGEST", "false").lower() == "true":
            print("Skipping RAG auto-ingest as per SKIP_RAG_AUTO_INGEST env var.")
            return

        collection = cls.get_collection()
        if not collection:
            return

        try:
            from database import topics_collection
            if collection.count() > 0:
                print("RAG database already contains data. Skipping initial seed.")
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
                
            # 2. Automatically try to ingest PDFs if they exist
            cls._auto_ingest_pdfs()
            
        except Exception as e:
            print(f"RAG seeding error: {e}")

    @classmethod
    def _auto_ingest_pdfs(cls):
        """Internal helper to ingest PDFs page-by-page using lazy loading."""
        try:
            from langchain_community.document_loaders import PyPDFLoader
            
            base_path = os.path.join(os.path.dirname(__file__), "..", "constitution_db")
            if not os.path.exists(base_path):
                return
                
            pdfs = ["constitution_eng.pdf", "constitution_hindi.pdf"]
            
            for pdf_name in pdfs:
                path = os.path.join(base_path, pdf_name)
                if os.path.exists(path):
                    print(f"Auto-ingesting {pdf_name} page-by-page...")
                    loader = PyPDFLoader(path)
                    
                    # Use lazy_load to avoid loading full PDF into memory
                    # Process every page immediately
                    for i, page in enumerate(loader.lazy_load()):
                        doc_chunk = [{
                            "content": page.page_content,
                            "metadata": {"source": pdf_name, "page": i}
                        }]
                        cls.add_documents(doc_chunk)
                        
                        if i % 50 == 0:
                            print(f"   - Progress: {i} pages indexed...")
                    
                    print(f"Finished indexing {pdf_name}")
                    
        except Exception as e:
            print(f"RAG auto-ingest warning: {e}")


