from database import users_collection, User
from typing import Optional, Dict
import bcrypt
import jwt
from datetime import datetime, timedelta
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")

class AuthService:
    @staticmethod
    def register_user(username: str, email: str, password: str, role: str = "user", phone: str = None, address: str = None, city: str = None) -> Dict:
        # Check if user already exists
        existing_user = users_collection.find_one({
            "$or": [{"username": username}, {"email": email}]
        })
        
        if existing_user:
            return {"success": False, "message": "Username or email already exists"}
        
        # Create new user
        user = User(username, email, password, role, phone, address, city)
        user_data = {
            "username": user.username,
            "email": user.email,
            "password_hash": user.password_hash,
            "role": user.role,
            "phone": user.phone,
            "address": user.address,
            "city": user.city,
            "is_verified": user.is_verified,
            "created_at": user.created_at,
            "is_active": user.is_active
        }
        
        result = users_collection.insert_one(user_data)
        
        return {
            "success": True,
            "message": "User registered successfully",
            "user_id": str(result.inserted_id)
        }
    
    @staticmethod
    def login_user(username: str, password: str) -> Dict:
        # Find user by username or email
        user = users_collection.find_one({
            "$or": [{"username": username}, {"email": username}]
        })
        
        if not user:
            return {"success": False, "message": "Invalid credentials"}
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user["password_hash"]):
            return {"success": False, "message": "Invalid credentials"}
        
        # Generate JWT token
        token = jwt.encode({
            "user_id": str(user["_id"]),
            "username": user["username"],
            "role": user.get("role", "user"),
            "is_verified": user.get("is_verified", True),
            "exp": datetime.utcnow() + timedelta(days=7)
        }, SECRET_KEY)
        
        return {
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "is_verified": user.get("is_verified", True)
            }
        }
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
