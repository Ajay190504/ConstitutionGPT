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
                "content": "The Fundamental Rights are defined in Part III of the Indian Constitution. These include Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies."
            },
            {
                "title": "Directive Principles",
                "description": "Guidelines for the government to establish social and economic democracy",
                "content": "Directive Principles of State Policy are defined in Part IV of the Constitution. These are fundamental in governance of the country and include principles related to social justice, economic welfare, foreign policy, and legal principles."
            },
            {
                "title": "Fundamental Duties",
                "description": "Moral obligations of citizens to promote patriotism and unity",
                "content": "Fundamental Duties are defined in Part IV-A of the Constitution. These were added by the 42nd Amendment and include duties like respecting the Constitution, cherishing noble ideals, defending the country, and promoting harmony."
            },
            {
                "title": "Union Executive",
                "description": "The President, Vice-President, Prime Minister and Council of Ministers",
                "content": "The Union Executive consists of the President as the head of state, the Vice-President, the Prime Minister as head of government, and the Council of Ministers. The President exercises powers on the aid and advice of the Council of Ministers."
            },
            {
                "title": "Parliament",
                "description": "The supreme legislative body of India consisting of Lok Sabha and Rajya Sabha",
                "content": "The Parliament of India is bicameral with Lok Sabha (House of the People) and Rajya Sabha (Council of States). It has powers to make laws on subjects in the Union List and Concurrent List, and can also make laws on State List under certain circumstances."
            },
            {
                "title": "Judiciary",
                "description": "The integrated judicial system with Supreme Court at the apex",
                "content": "The Indian judiciary is an integrated hierarchical system with the Supreme Court at the top, followed by High Courts in states, and subordinate courts below. It has the power of judicial review and acts as the guardian of the Constitution."
            }
        ]
        
        # Check if topics already exist
        if topics_collection.count_documents({}) == 0:
            for topic_data in default_topics:
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
