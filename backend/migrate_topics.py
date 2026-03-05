import os
import sys
from dotenv import load_dotenv

# Add backend to path so we can import database and services
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import topics_collection
from services.topics_service import TopicsService

def migrate_topics():
    print("🚀 Starting topics migration...")
    
    # Optional: Clear existing topics if you want a fresh start
    # print("🗑️ Clearing existing topics...")
    # topics_collection.delete_many({})
    
    # Initialize default topics (using the updated list in TopicsService)
    print("🌱 Seeding topics from TopicsService...")
    TopicsService.initialize_default_topics()
    
    count = topics_collection.count_documents({})
    print(f"✅ Migration complete. Total topics in database: {count}")

if __name__ == "__main__":
    migrate_topics()
