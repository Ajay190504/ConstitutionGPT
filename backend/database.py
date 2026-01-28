from pymongo import MongoClient
from datetime import datetime
from typing import Optional, List, Dict
import bcrypt

import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")

client = MongoClient(mongo_uri)
db = client["constitution_gpt"]

# Collections
users_collection = db["users"]
chat_collection = db["chats"]
topics_collection = db["topics"]
lawyer_chat_collection = db["lawyer_chats"]
refresh_tokens_collection = db["refresh_tokens"]

class User:
    def __init__(self, username: str, email: str, password: str, role: str = "user", phone: str = None, address: str = None, city: str = None):
        self.username = username
        self.email = email
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.role = role # user, lawyer, admin
        self.phone = phone
        self.address = address
        self.city = city
        self.is_verified = True if role != "lawyer" else False
        self.created_at = datetime.utcnow()
        self.is_active = True

class ChatMessage:
    def __init__(self, user_id: str, message: str, response: str):
        self.user_id = user_id
        self.message = message
        self.response = response
        self.timestamp = datetime.utcnow()

class LawyerChatMessage:
    def __init__(self, sender_id: str, receiver_id: str, message: str):
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.message = message
        self.timestamp = datetime.utcnow()
        self.is_read = False

class Topic:
    def __init__(self, title: str, description: str, content: str):
        self.title = title
        self.description = description
        self.content = content
        self.created_at = datetime.utcnow()
