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
            from chromadb.utils import embedding_functions
            
            # Initialize persistent client
            db_path = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
            client = chromadb.PersistentClient(path=db_path)
            
            # Using a free, local embedding function
            cls._embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            cls._collection = client.get_or_create_collection(
                name="indian_constitution",
                embedding_function=cls._embedding_function
            )
            cls._initialized_chroma = True
            return cls._collection
        except ImportError:
            # Silence import errors as we have a fallback
            return None
        except Exception as e:
            print(f"Error initializing ChromaDB: {e}")
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
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            
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
        """Seed the vector DB with existing constitutional topics."""
        collection = cls.get_collection()
        if not collection:
            return

        try:
            from database import topics_collection
            if collection.count() > 0:
                return
                
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
        except Exception as e:
            print(f"RAG seeding error: {e}")
