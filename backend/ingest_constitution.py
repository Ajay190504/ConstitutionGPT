import os
import sys
import argparse
from typing import List

# Add current directory to path so we can import services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from services.rag_service import RAGService
    from dotenv import load_dotenv
    load_dotenv()
except ImportError as e:
    print(f"FAILED: Missing dependencies: {e}")
    print("Please run: pip install chromadb langchain langchain-community pypdf")
    sys.exit(1)

def ingest_pdfs(pdf_paths: List[str]):
    print(f"--- Starting ingestion for {len(pdf_paths)} files ---")
    
    all_docs = []
    
    for path in pdf_paths:
        if not os.path.exists(path):
            print(f"WARN: File not found at {path}")
            continue
            
        print(f"Loading {os.path.basename(path)}...")
        try:
            loader = PyPDFLoader(path)
            # metadata will automatically include the source path
            docs = loader.load()
            print(f"LOADED: {len(docs)} pages from {os.path.basename(path)}")
            
            # Simple manual formatting to include file info in content if needed
            for doc in docs:
                all_docs.append({
                    "content": doc.page_content,
                    "metadata": {
                        "source": os.path.basename(path),
                        "page": doc.metadata.get("page", 0)
                    }
                })
        except Exception as e:
            print(f"ERROR: Failed to load {path}: {e}")

    if not all_docs:
        print("Empty document list. Nothing to index.")
        return

    print(f"Adding {len(all_docs)} sections to ChromaDB (this may take a few minutes)...")
    try:
        # RAGService.add_documents handles splitting and adding
        RAGService.add_documents(all_docs)
        print("SUCCESS: Ingestion complete! RAG is now ready with PDF data.")
    except Exception as e:
        print(f"ERROR: Failed to add documents to ChromaDB: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Constitution PDFs into ChromaDB")
    parser.add_argument("--langs", nargs="+", default=["eng", "hindi"], help="Languages to ingest (eng, hindi)")
    args = parser.parse_args()

    base_path = os.path.join(os.path.dirname(__file__), "constitution_db")
    target_pdfs = []
    
    if "eng" in args.langs:
        target_pdfs.append(os.path.join(base_path, "constitution_eng.pdf"))
    if "hindi" in args.langs:
        target_pdfs.append(os.path.join(base_path, "constitution_hindi.pdf"))

    ingest_pdfs(target_pdfs)
