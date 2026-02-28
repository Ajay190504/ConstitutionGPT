from database import topics_collection, Topic
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId

class TopicsService:
    @staticmethod
    def initialize_default_topics():
        """Initialize default constitutional topics"""
        default_topics = [
            {
                "title": "Fundamental Rights",
                "description": "Basic rights guaranteed to all citizens of India",
                "content": "(Source: Part III, Article 12-35) The Fundamental Rights include: Right to Equality (Article 14-18), Right to Freedom (Article 19-22), Right against Exploitation (Article 23-24), Right to Freedom of Religion (Article 25-28), Cultural and Educational Rights (Article 29-30), and Right to Constitutional Remedies (Article 32)."
            },
            {
                "title": "Directive Principles",
                "description": "Guidelines for the government to establish social and economic democracy",
                "content": "(Source: Part IV, Article 36-51) Directive Principles of State Policy include principles related to social justice, economic welfare, foreign policy, and legal principles like Uniform Civil Code (Article 44)."
            },
            {
                "title": "Fundamental Duties",
                "description": "Moral obligations of citizens to promote patriotism and unity",
                "content": "(Source: Part IV-A, Article 51A) Fundamental Duties include respecting the Constitution, cherishing noble ideals, defending the country, and promoting harmony."
            },
            {
                "title": "Union Executive",
                "description": "The President, Vice-President, Prime Minister and Council of Ministers",
                "content": "(Source: Part V, Chapter I, Article 52-78) The Union Executive consists of the President (Article 52), Vice-President (Article 63), and the Council of Ministers headed by the Prime Minister (Article 74)."
            },
            {
                "title": "Parliament",
                "description": "The supreme legislative body of India consisting of Lok Sabha and Rajya Sabha",
                "content": "(Source: Part V, Chapter II, Article 79-122) The Parliament consists of the President and two Houses: Rajya Sabha (Article 80) and Lok Sabha (Article 81)."
            },
            {
                "title": "Judiciary",
                "description": "The integrated judicial system with Supreme Court at the apex",
                "content": "(Source: Part V, Chapter IV, Article 124-147) The Supreme Court of India (Article 124) is the highest court, followed by High Courts (Article 214) and subordinate courts."
            },
            {
                "title": "Bharatiya Nyaya Sanhita (BNS), 2023",
                "description": "The new criminal code replacing the Indian Penal Code (IPC)",
                "content": "(Source: BNS, 2023) Replaces IPC 1860. Key Sections: Sedition is replaced by 'Acts endangering sovereignty' (Section 150), Mob Lynchings (Section 103), and Organized Crime (Section 109)."
            },
            {
                "title": "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023",
                "description": "New procedural law replacing the Code of Criminal Procedure (CrPC)",
                "content": "(Source: BNSS, 2023) Replaces CrPC 1973. Key Changes: Timeline for filing chargesheets (Section 193), Video conferencing for trials (Section 532), and zero FIR (Section 173)."
            },
            {
                "title": "Bharatiya Sakshya Adhiniyam (BSA), 2023",
                "description": "New evidence law replacing the Indian Evidence Act",
                "content": "(Source: BSA, 2023) Replaces Indian Evidence Act 1872. Expands evidence to include digital records (Section 2), Primary evidence (Section 57), and Secondary evidence (Section 58)."
            }
        ]
        
        for topic_data in default_topics:
            # Check if this specific topic already exists
            if not topics_collection.find_one({"title": topic_data["title"]}):
                topic = Topic(topic_data["title"], topic_data["description"], topic_data["content"])
                topic_doc = {
                    "title": topic.title,
                    "description": topic.description,
                    "content": topic.content,
                    "created_at": topic.created_at
                }
                topics_collection.insert_one(topic_doc)
    
    @staticmethod
    def get_all_topics() -> List[Dict]:
        topics = topics_collection.find().sort("title", 1)
        
        return [
            {
                "id": str(topic["_id"]),
                "title": topic["title"],
                "description": topic["description"],
                "content": topic["content"],
                "created_at": topic["created_at"]
            }
            for topic in topics
        ]
    
    @staticmethod
    def get_topic_by_id(topic_id: str) -> Optional[Dict]:
        try:
            topic = topics_collection.find_one({"_id": ObjectId(topic_id)})
            
            if topic:
                return {
                    "id": str(topic["_id"]),
                    "title": topic["title"],
                    "description": topic["description"],
                    "content": topic["content"],
                    "created_at": topic["created_at"]
                }
            return None
        except:
            return None
    
    @staticmethod
    def search_topics(query: str) -> List[Dict]:
        topics = topics_collection.find({
            "$or": [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]
        }).sort("title", 1)
        
        return [
            {
                "id": str(topic["_id"]),
                "title": topic["title"],
                "description": topic["description"],
                "content": topic["content"],
                "created_at": topic["created_at"]
            }
            for topic in topics
        ]
