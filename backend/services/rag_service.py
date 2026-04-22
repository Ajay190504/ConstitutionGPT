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
            print(f"🚀 RAG Mode: {embedding_mode.upper()}. Vector Database bypassed.")
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
                    print("🧠 Attempting to use OpenAI Embeddings (Memory-Efficient Mode)...")
                    cls._embedding_function = embedding_functions.OpenAIEmbeddingFunction(
                        api_key=openai_key,
                        model_name="text-embedding-3-small"
                    )
                    # Test if OpenAI key works
                    cls._embedding_function(["test"])
                    print("✅ OpenAI Embeddings verified.")
                except Exception as e:
                    print(f"⚠️ OpenAI Embedding failed (Quota reached?): {e}")
                    if embedding_mode == "openai":
                        print("❌ Forced OpenAI mode failed. Falling back to Keyword search.")
                        return None
                    print("🔄 Falling back to Local Embeddings...")
                    cls._embedding_function = embedding_functions.DefaultEmbeddingFunction()
            else:
                print("⚠️ Using Local Embeddings (High Memory Usage). Consider using OPENAI_API_KEY to save RAM.")
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
    def add_documents(cls, documents: List[Dict[str, str]], batch_size: int = 50):
        """
        Expects a list of dicts with 'content' and 'metadata'.
        Processed in batches to prevent memory spikes.
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
            
            all_texts = []
            all_metadatas = []
            all_ids = []
            
            # Step 1: Split all docs into chunks first (minimal memory impact compared to embedding)
            for i, doc in enumerate(documents):
                chunks = text_splitter.split_text(doc["content"])
                source = doc.get("metadata", {}).get("source", "unknown")
                for j, chunk in enumerate(chunks):
                    all_ids.append(f"{source}_{i}_chunk_{j}_{int(time.time())}")
                    all_texts.append(chunk)
                    all_metadatas.append(doc.get("metadata", {}))
            
            # Step 2: Add to Chroma in batches (this is where memory spikes happen during embedding)
            total_chunks = len(all_texts)
            if total_chunks == 0:
                return

            print(f"📦 Adding {total_chunks} chunks to ChromaDB in batches of {batch_size}...")
            
            for i in range(0, total_chunks, batch_size):
                end = min(i + batch_size, total_chunks)
                batch_texts = all_texts[i:end]
                batch_metadatas = all_metadatas[i:end]
                batch_ids = all_ids[i:end]
                
                collection.add(
                    ids=batch_ids,
                    documents=batch_texts,
                    metadatas=batch_metadatas
                )
                print(f"✅ Added batch {i//batch_size + 1}/{(total_chunks + batch_size - 1)//batch_size} ({end}/{total_chunks} chunks)")
                
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
            print("⏭️ Skipping RAG auto-ingest as per SKIP_RAG_AUTO_INGEST env var.")
            return

        collection = cls.get_collection()
        if not collection:
            return

        try:
            from database import topics_collection
            if collection.count() > 0:
                print("ℹ️ RAG database already contains data. Skipping initial seed.")
                return
            
            print("🚀 Seeding RAG database with initial data...")
            
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
        """Internal helper to ingest PDFs page-by-page to save memory."""
        try:
            from langchain_community.document_loaders import PyPDFLoader
            
            base_path = os.path.join(os.path.dirname(__file__), "..", "constitution_db")
            if not os.path.exists(base_path):
                return
                
            pdfs = ["constitution_eng.pdf", "constitution_hindi.pdf"]
            
            for pdf_name in pdfs:
                path = os.path.join(base_path, pdf_name)
                if os.path.exists(path):
                    print(f"📄 Auto-ingesting {pdf_name} page-by-page...")
                    loader = PyPDFLoader(path)
                    
                    # Instead of loading all pages into memory, we process one by one
                    # Note: PyPDFLoader.load() is still used but we clear the list often or process immediately
                    pages = loader.load()
                    
                    pdf_docs = []
                    for page in pages:
                        pdf_docs.append({
                            "content": page.page_content,
                            "metadata": {"source": pdf_name, "page": page.metadata.get("page", 0)}
                        })
                        
                        # Add in smaller per-page chunks to keep memory usage low
                        if len(pdf_docs) >= 10: # Process every 10 pages
                            cls.add_documents(pdf_docs)
                            pdf_docs = []
                    
                    # Final batch for the current PDF
                    if pdf_docs:
                        cls.add_documents(pdf_docs)
                    
                    print(f"✅ Finished indexing {pdf_name}")
                    
        except Exception as e:
            print(f"RAG auto-ingest warning: {e}")

