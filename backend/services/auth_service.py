from database import users_collection, refresh_tokens_collection, User
from typing import Optional, Dict
import bcrypt
import jwt
from datetime import datetime, timedelta
import os
from bson import ObjectId

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "your-refresh-secret-key-here")

class AuthService:
    @staticmethod
    def create_access_token(user_data: Dict) -> str:
        payload = {
            "user_id": str(user_data["_id"]),
            "username": user_data["username"],
            "role": user_data.get("role", "user"),
            "is_verified": user_data.get("is_verified", True),
            "exp": datetime.utcnow() + timedelta(minutes=30) # Short-lived
        }
        return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=7), # Long-lived
            "type": "refresh"
        }
        refresh_token = jwt.encode(payload, REFRESH_SECRET_KEY, algorithm="HS256")
        
        # Store in DB for rotation/revocation
        refresh_tokens_collection.insert_one({
            "user_id": user_id,
            "token": refresh_token,
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=7)
        })
        return refresh_token

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
        
        # Generate tokens
        user_id = str(user["_id"])
        access_token = AuthService.create_access_token(user)
        refresh_token = AuthService.create_refresh_token(user_id)
        
        return {
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user_id,
                "username": user["username"],
                "email": user["email"],
                "role": user.get("role", "user"),
                "is_verified": user.get("is_verified", True)
            }
        }
    
    @staticmethod
    def refresh_token(token: str) -> Dict:
        try:
            payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != "refresh":
                return {"success": False, "message": "Invalid token type"}
            
            user_id = payload["user_id"]
            
            # Check if token exists in DB (revocation/rotation)
            stored_token = refresh_tokens_collection.find_one({"token": token})
            if not stored_token:
                return {"success": False, "message": "Token has been revoked or rotated"}
            
            # Rotate token: Delete old, create new
            refresh_tokens_collection.delete_one({"token": token})
            
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return {"success": False, "message": "User not found"}
            
            new_access_token = AuthService.create_access_token(user)
            new_refresh_token = AuthService.create_refresh_token(user_id)
            
            return {
                "success": True,
                "access_token": new_access_token,
                "refresh_token": new_refresh_token
            }
        except jwt.ExpiredSignatureError:
            return {"success": False, "message": "Refresh token expired"}
        except jwt.InvalidTokenError:
            return {"success": False, "message": "Invalid refresh token"}

    @staticmethod
    def verify_token(token: str) -> Optional[Dict]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
