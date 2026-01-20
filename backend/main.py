from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
from services.auth_service import AuthService
from services.chat_service import ChatService
from services.topics_service import TopicsService

load_dotenv()

app = FastAPI()

# ✅ ADD THIS (CORS FIX)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
security = HTTPBearer()

# Initialize default topics on startup
@app.on_event("startup")
async def startup_event():
    TopicsService.initialize_default_topics()

# Pydantic Models
class ChatRequest(BaseModel):
    message: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"
    phone: str = None
    address: str = None
    city: str = None

class LawyerResponse(BaseModel):
    id: str
    username: str
    email: str
    phone: str = None
    address: str = None
    city: str = None
    is_verified: bool

class VerificationRequest(BaseModel):
    lawyer_id: str
    is_verified: bool

class SendMessageRequest(BaseModel):
    receiver_id: str
    message: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Dependency to verify JWT token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# Dependency to check admin role
async def check_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Authentication endpoints
@app.post("/register")
def register(req: RegisterRequest):
    result = AuthService.register_user(
        req.username, req.email, req.password, 
        req.role, req.phone, req.address, req.city
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.post("/login")
def login(req: LoginRequest):
    result = AuthService.login_user(req.username, req.password)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result

@app.get("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": current_user}

# Chat endpoints
@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are ConstitutionGPT, expert in Indian Constitution."},
            {"role": "user", "content": req.message}
        ]
    )
    
    reply = response.choices[0].message.content
    
    # Save chat to database
    ChatService.save_chat_message(current_user["user_id"], req.message, reply)
    
    return {"reply": reply}

@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    history = ChatService.get_user_chat_history(current_user["user_id"])
    return {"history": history}

@app.get("/chat/{chat_id}")
async def get_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    chat = ChatService.get_chat_by_id(chat_id, current_user["user_id"])
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.delete("/chat/{chat_id}")
async def delete_chat(chat_id: str, current_user: dict = Depends(get_current_user)):
    result = ChatService.delete_chat(chat_id, current_user["user_id"])
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

# Topics endpoints
@app.get("/topics")
async def get_topics():
    topics = TopicsService.get_all_topics()
    return {"topics": topics}

@app.get("/topics/{topic_id}")
async def get_topic(topic_id: str):
    topic = TopicsService.get_topic_by_id(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic

@app.get("/topics/search/{query}")
async def search_topics(query: str):
    topics = TopicsService.search_topics(query)
    return {"topics": topics}

# Lawyer Directory & Admin Verification
@app.get("/lawyers")
async def get_lawyers(city: str = None):
    from database import users_collection
    query = {"role": "lawyer", "is_verified": True}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    lawyers = []
    for l in users_collection.find(query):
        lawyers.append({
            "id": str(l["_id"]),
            "username": l["username"],
            "email": l["email"],
            "phone": l.get("phone"),
            "address": l.get("address"),
            "city": l.get("city"),
            "is_verified": l.get("is_verified", False)
        })
    return {"lawyers": lawyers}

@app.get("/admin/lawyers")
async def admin_get_lawyers(current_admin: dict = Depends(check_admin)):
    from database import users_collection
    lawyers = []
    for l in users_collection.find({"role": "lawyer"}):
        lawyers.append({
            "id": str(l["_id"]),
            "username": l["username"],
            "email": l["email"],
            "phone": l.get("phone"),
            "address": l.get("address"),
            "city": l.get("city"),
            "is_verified": l.get("is_verified", False)
        })
    return {"lawyers": lawyers}

@app.post("/admin/verify")
async def admin_verify_lawyer(req: VerificationRequest, current_admin: dict = Depends(check_admin)):
    from database import users_collection
    from bson import ObjectId
    result = users_collection.update_one(
        {"_id": ObjectId(req.lawyer_id)},
        {"$set": {"is_verified": req.is_verified}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return {"success": True, "message": f"Lawyer {'verified' if req.is_verified else 'unverified'} successfully"}

# Person-to-Person Messaging
@app.post("/messages")
async def send_message(req: SendMessageRequest, current_user: dict = Depends(get_current_user)):
    from database import lawyer_chat_collection, LawyerChatMessage
    
    new_msg = LawyerChatMessage(
        sender_id=current_user["user_id"],
        receiver_id=req.receiver_id,
        message=req.message
    )
    
    msg_data = {
        "sender_id": new_msg.sender_id,
        "receiver_id": new_msg.receiver_id,
        "message": new_msg.message,
        "timestamp": new_msg.timestamp,
        "is_read": new_msg.is_read
    }
    
    result = lawyer_chat_collection.insert_one(msg_data)
    return {"success": True, "message_id": str(result.inserted_id)}

@app.get("/messages/{other_id}")
async def get_messages(other_id: str, current_user: dict = Depends(get_current_user)):
    from database import lawyer_chat_collection
    
    # Get messages where current_user is either sender or receiver
    query = {
        "$or": [
            {"sender_id": current_user["user_id"], "receiver_id": other_id},
            {"sender_id": other_id, "receiver_id": current_user["user_id"]}
        ]
    }
    
    messages = []
    for msg in lawyer_chat_collection.find(query).sort("timestamp", 1):
        messages.append({
            "id": str(msg["_id"]),
            "sender_id": msg["sender_id"],
            "receiver_id": msg["receiver_id"],
            "message": msg["message"],
            "timestamp": msg["timestamp"],
            "is_read": msg.get("is_read", False)
        })
        
    return {"messages": messages}

@app.post("/change-password")
async def change_password(req: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    from database import users_collection
    from bson import ObjectId
    import bcrypt
    
    user = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Verify current password
    if not bcrypt.checkpw(req.current_password.encode('utf-8'), user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    # Hash and update new password
    new_hash = bcrypt.hashpw(req.new_password.encode('utf-8'), bcrypt.gensalt())
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {"password_hash": new_hash}}
    )
    
    return {"success": True, "message": "Password updated successfully"}

@app.get("/chat-inbox")
async def get_chat_inbox(current_user: dict = Depends(get_current_user)):
    from database import lawyer_chat_collection, users_collection
    from bson import ObjectId
    
    # Find all unique people current_user has chatted with
    user_id = current_user["user_id"]
    
    # Using aggregation to find unique conversation partners
    pipeline = [
        {"$match": {"$or": [{"sender_id": user_id}, {"receiver_id": user_id}]}},
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": {
                "$cond": [
                    {"$eq": ["$sender_id", user_id]},
                    "$receiver_id",
                    "$sender_id"
                ]
            },
            "last_message": {"$first": "$message"},
            "timestamp": {"$first": "$timestamp"},
            "unread_count": {
                "$sum": {
                    "$cond": [
                        {"$and": [{"$eq": ["$receiver_id", user_id]}, {"$eq": ["$is_read", False]}]},
                        1,
                        0
                    ]
                }
            }
        }}
    ]
    
    conversations = list(lawyer_chat_collection.aggregate(pipeline))
    
    result = []
    for conv in conversations:
        other_user = users_collection.find_one({"_id": ObjectId(conv["_id"])})
        if other_user:
            result.append({
                "other_user_id": str(other_user["_id"]),
                "other_username": other_user["username"],
                "other_role": other_user.get("role", "user"),
                "last_message": conv["last_message"],
                "timestamp": conv["timestamp"],
                "unread_count": conv["unread_count"]
            })
            
    return {"conversations": result}

@app.get("/")
def root():
    return {"message": "ConstitutionGPT API is running"}
