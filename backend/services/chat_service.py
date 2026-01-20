from database import chat_collection, ChatMessage
from typing import List, Dict, Optional
from datetime import datetime
from bson import ObjectId

class ChatService:
    @staticmethod
    def save_chat_message(user_id: str, message: str, response: str) -> Dict:
        chat = ChatMessage(user_id, message, response)
        chat_data = {
            "user_id": user_id,
            "message": message,
            "response": response,
            "timestamp": chat.timestamp
        }
        
        result = chat_collection.insert_one(chat_data)
        
        return {
            "success": True,
            "chat_id": str(result.inserted_id),
            "timestamp": chat.timestamp
        }
    
    @staticmethod
    def get_user_chat_history(user_id: str, limit: int = 50) -> List[Dict]:
        chats = chat_collection.find(
            {"user_id": user_id}
        ).sort("timestamp", -1).limit(limit)
        
        return [
            {
                "id": str(chat["_id"]),
                "message": chat["message"],
                "response": chat["response"],
                "timestamp": chat["timestamp"]
            }
            for chat in chats
        ]
    
    @staticmethod
    def get_chat_by_id(chat_id: str, user_id: str) -> Optional[Dict]:
        try:
            chat = chat_collection.find_one({
                "_id": ObjectId(chat_id),
                "user_id": user_id
            })
            
            if chat:
                return {
                    "id": str(chat["_id"]),
                    "message": chat["message"],
                    "response": chat["response"],
                    "timestamp": chat["timestamp"]
                }
            return None
        except:
            return None
    
    @staticmethod
    def delete_chat(chat_id: str, user_id: str) -> Dict:
        try:
            result = chat_collection.delete_one({
                "_id": ObjectId(chat_id),
                "user_id": user_id
            })
            
            return {
                "success": result.deleted_count > 0,
                "message": "Chat deleted successfully" if result.deleted_count > 0 else "Chat not found"
            }
        except:
            return {"success": False, "message": "Failed to delete chat"}
