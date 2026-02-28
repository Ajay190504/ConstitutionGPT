from pymongo import MongoClient
from datetime import datetime
from typing import Optional, List, Dict
import bcrypt

import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(mongo_uri)
db = client["constitution_gpt"]

# Collections
users_collection = db["users"]
chat_collection = db["chats"]
topics_collection = db["topics"]
lawyer_chat_collection = db["lawyer_chats"]
refresh_tokens_collection = db["refresh_tokens"]
reviews_collection = db["reviews"]
appointments_collection = db["appointments"]

class User:
    def __init__(self, username: str, email: str, password: str, role: str = "user", phone: str = None, address: str = None, city: str = None, lawyer_id_proof: str = None, lawyer_proof_file: str = None, consultation_fee: float = 0.0, specialization: str = None, years_of_experience: int = 0):
        self.username = username
        self.email = email
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        self.role = role # user, lawyer, admin
        self.phone = phone
        self.address = address
        self.city = city
        self.lawyer_id_proof = lawyer_id_proof
        self.lawyer_proof_file = lawyer_proof_file
        self.consultation_fee = consultation_fee
        self.specialization = specialization
        self.years_of_experience = years_of_experience
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
    def __init__(self, sender_id: str, receiver_id: str, message: str, file_url: str = None, file_name: str = None, file_type: str = None):
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.message = message
        self.file_url = file_url
        self.file_name = file_name
        self.file_type = file_type
        self.timestamp = datetime.utcnow()
        self.is_read = False

class Appointment:
    def __init__(self, user_id: str, lawyer_id: str, date: str, time_slot: str, notes: str = None):
        self.user_id = user_id
        self.lawyer_id = lawyer_id
        self.date = date  # YYYY-MM-DD
        self.time_slot = time_slot  # e.g., "10:00 AM"
        self.notes = notes
        self.status = "pending" # pending, confirmed, cancelled, completed
        self.created_at = datetime.utcnow()

class Topic:
    def __init__(self, title: str, description: str, content: str):
        self.title = title
        self.description = description
        self.content = content
        self.created_at = datetime.utcnow()

class Review:
    def __init__(self, user_id: str, lawyer_id: str, rating: int, comment: str = None):
        self.user_id = user_id
        self.lawyer_id = lawyer_id
        self.rating = rating  # 1-5
        self.comment = comment
        self.created_at = datetime.utcnow()
