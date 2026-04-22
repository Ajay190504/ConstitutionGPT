from fastapi import FastAPI, HTTPException, Depends, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import openai
from groq import Groq
from dotenv import load_dotenv
import os
import time
from collections import defaultdict
import threading
from services.auth_service import AuthService
from services.chat_service import ChatService
from services.topics_service import TopicsService
from services.rag_service import RAGService
from services.speech_service import SpeechService
from services.gcs_service import GCSService

load_dotenv()

# Ensure uploads directory exists before mounting
DATA_DIR = os.getenv("DATA_DIR", ".")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(os.path.join(UPLOADS_DIR, "chats"), exist_ok=True)
os.makedirs(os.path.join(UPLOADS_DIR, "lawyer_proofs"), exist_ok=True)

app = FastAPI()

# Health check and root routes (moved here for Render deployment reliability)
@app.get("/health")
@app.head("/health")
async def health_check():
    print("Health check received")
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/")
@app.head("/")
async def root():
    return {"message": "ConstitutionGPT API is running"}

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# ✅ CORS FIX - Added FIRST to be the OUTERMOST middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # Set to False to allow wildcard origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple Rate Limiting Middleware
user_requests = defaultdict(list)
RATE_LIMIT = 60 # requests
TIME_WINDOW = 60 # seconds

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Filter out requests older than the time window
    user_requests[client_ip] = [t for t in user_requests[client_ip] if now - t < TIME_WINDOW]
    
    if len(user_requests[client_ip]) >= RATE_LIMIT:
        return JSONResponse(
            status_code=429, 
            content={"detail": "Too many requests. Please try again later."}
        )
    
    # Exempt health check and root routes from rate limiting
    if request.url.path in ["/health", "/"]:
        return await call_next(request)

    try:
        user_requests[client_ip].append(now)
        return await call_next(request)
    except Exception as e:
        print(f"Middleware Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Internal Server Error: {str(e)}"}
        )

# Global Exception Handler for OpenAI and other errors
@app.exception_handler(openai.RateLimitError)
async def openai_rate_limit_handler(request: Request, exc: openai.RateLimitError):
    return JSONResponse(
        status_code=429,
        content={"detail": "OpenAI API Quota Exceeded. Please check your billing/plan."}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(exc)}"}
    )

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
security = HTTPBearer()

# Initialize default topics on startup
@app.on_event("startup")
async def startup_event():
    # Basic check for API keys
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    if not groq_key or "gsk_" not in groq_key:
        print("\n⚠️ WARNING: GROQ_API_KEY is missing or invalid in backend/.env")
    if not openai_key or "sk-" not in openai_key:
        print("\n⚠️ WARNING: OPENAI_API_KEY is missing or invalid in backend/.env")

    TopicsService.initialize_default_topics()
    
    # Initialize RAG in a separate thread to prevent blocking server startup
    def run_rag_init():
        try:
            # Wait a bit for the server to stabilize and pass health checks
            print("⏳ Waiting 10s for server stabilization before RAG init...")
            time.sleep(10)
            
            if os.getenv("SKIP_RAG_AUTO_INGEST", "false").lower() == "true":
                print("ℹ️ RAG Auto-Ingest is DISABLED via environment variable.")
                
            print("🚀 Initializing AI Search (RAG) in background...")
            RAGService.initialize_with_topics()
            print("✅ AI Search initialization check complete.")
        except Exception as e:
            print(f"⚠️ RAG Initialization failed: {str(e)}")

    threading.Thread(target=run_rag_init, daemon=True).start()

# Pydantic Models
class ChatRequest(BaseModel):
    message: str
    lang: str = "en"

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"
    phone: str
    address: str
    city: str
    lawyer_id_proof: Optional[str] = None

class LawyerResponse(BaseModel):
    id: str
    username: str
    email: str
    phone: str = None
    address: str = None
    city: str = None
    lawyer_id_proof: str = None
    lawyer_proof_file: str = None
    is_verified: bool

class VerificationRequest(BaseModel):
    lawyer_id: str
    is_verified: bool

class SendMessageRequest(BaseModel):
    receiver_id: str
    message: str

class AppointmentRequest(BaseModel):
    lawyer_id: str
    date: str
    time_slot: str
    notes: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TopicRequest(BaseModel):
    title: str
    description: str
    content: str

class UserQueryRequest(BaseModel):
    subject: str
    message: str

# Dependency to verify JWT token
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from database import users_collection
    from bson import ObjectId
    
    token = credentials.credentials
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    # Fetch fresh user data to ensure profile changes are reflected
    user = users_collection.find_one({"_id": ObjectId(payload["user_id"])})
    if user:
        payload["city"] = user.get("city")
        payload["phone"] = user.get("phone")
        payload["address"] = user.get("address")
        payload["consultation_fee"] = user.get("consultation_fee")
        payload["specialization"] = user.get("specialization")
        payload["years_of_experience"] = user.get("years_of_experience")
        payload["is_verified"] = user.get("is_verified", False)
        
    return payload

# Role Check Dependency
def check_role(allowed_roles: list):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

# Dependency to check admin role (kept for backward compatibility or simple use)
async def check_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
# Authentication endpoints
@app.post("/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form("user"),
    phone: str = Form(...),
    address: str = Form(...),
    city: str = Form(...),
    lawyer_id_proof: str = Form(None),
    lawyer_proof_file: UploadFile = File(None),
    consultation_fee: float = Form(0.0),
    specialization: str = Form(None),
    years_of_experience: int = Form(0)
):
    # Enforce mandatory fields for lawyer role
    if role == "lawyer":
        if not lawyer_id_proof:
            raise HTTPException(status_code=400, detail="Lawyer ID proof number is required")
        if not lawyer_proof_file:
            raise HTTPException(status_code=400, detail="Lawyer document proof file is required")
        if not specialization:
            raise HTTPException(status_code=400, detail="Specialization is required")
    # Handle file upload if lawyer
    proof_filename = None
    if role == "lawyer" and lawyer_proof_file:
        file_bytes = await lawyer_proof_file.read()
        try:
            public_url = GCSService.upload_file(file_bytes, lawyer_proof_file.filename, lawyer_proof_file.content_type)
            proof_filename = public_url
        except Exception as e:
            print(f"\n⚠️ Executing local upload fallback! GCS Upload Failed. Quick Reason: {e}")
            # Fallback to local if GCS not configured properly yet
            filename = f"{int(time.time())}_{lawyer_proof_file.filename}"
            local_path = os.path.join(UPLOADS_DIR, "lawyer_proofs", filename)
            with open(local_path, "wb") as f:
                f.write(file_bytes)
            proof_filename = f"lawyer_proofs/{filename}"

    result = AuthService.register_user(
        username, email, password, 
        role, phone, address, city,
        lawyer_id_proof, proof_filename,
        consultation_fee, specialization,
        years_of_experience
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

@app.post("/refresh")
def refresh(req: RefreshRequest):
    result = AuthService.refresh_token(req.refresh_token)
    if not result["success"]:
        raise HTTPException(status_code=401, detail=result["message"])
    return result

forgot_rate_limits = defaultdict(list)
FORGOT_LIMIT = 5
FORGOT_WINDOW = 3600 # 1 hour

@app.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    from database import users_collection
    from services.email_service import send_reset_email
    
    email_query = req.email.lower().strip()
    now = time.time()
    
    forgot_rate_limits[email_query] = [t for t in forgot_rate_limits.get(email_query, []) if now - t < FORGOT_WINDOW]
    if len(forgot_rate_limits.get(email_query, [])) >= FORGOT_LIMIT:
        raise HTTPException(status_code=429, detail="Too many reset requests. Please try again later.")
    forgot_rate_limits[email_query].append(now)
    
    # Case-insensitive lookup for the user
    user = users_collection.find_one({"email": {"$regex": f"^{req.email}$", "$options": "i"}})
    if user:
        user_id = str(user["_id"])
        token = AuthService.generate_reset_token(user_id)
        # Using FRONTEND_URL or defaulting to the active deployment
        frontend_url = os.getenv("FRONTEND_URL", "https://constitution-gpt-blue.vercel.app").rstrip("/")
        reset_link = f"{frontend_url}/reset-password?token={token}"
        print(f"DEBUG Reset Link generated for {req.email}: {reset_link}")
        
        success = send_reset_email(req.email, reset_link)
        if not success:
            return {"success": False, "message": "Failed to send the email. Please contact support or check server logs."}
        
    return {"success": True, "message": "If that email is registered, a reset link has been sent."}

@app.post("/reset-password")
async def reset_password(req: ResetPasswordRequest):
    from database import users_collection
    from bson import ObjectId
    import bcrypt
    
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    
    user_id = AuthService.verify_reset_token(req.token)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if bcrypt.checkpw(req.new_password.encode('utf-8'), user["password_hash"]):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the old password")
        
    new_hash = bcrypt.hashpw(req.new_password.encode('utf-8'), bcrypt.gensalt())
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password_hash": new_hash}}
    )
    return {"success": True, "message": "Password reset successfully"}

@app.get("/verify-token")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": current_user}

# User-specific chat rate limiting
chat_rate_limits = defaultdict(list)
CHAT_LIMIT = 5 # messages
CHAT_WINDOW = 60 # seconds

# Chat endpoints
@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    # Rate limit check
    user_id = current_user["user_id"]
    now = time.time()
    
    # Clean up old timestamps
    chat_rate_limits[user_id] = [t for t in chat_rate_limits[user_id] if now - t < CHAT_WINDOW]
    
    if len(chat_rate_limits[user_id]) >= CHAT_LIMIT:
        raise HTTPException(
            status_code=429, 
            detail="Rate limit reached. Please wait a minute before sending more messages."
        )
    
    chat_rate_limits[user_id].append(now)

    try:
        # Retrieve context from RAG
        context_docs = RAGService.query(req.message)
        context_text = "\n".join(context_docs)
        
        system_prompt = (
            "You are 'ConstitutionGPT', an expert AI specialized in the Indian Constitution and the Indian Legal System.\n\n"
            "SCOPE GUIDELINES:\n"
            "1. IN-SCOPE: Any query related to Indian law, rights, duties, crimes, punishments, police procedures, court systems, or government regulations. This includes natural language questions (e.g., 'What happens if I lose my ID?' or 'Can police enter my house?') even if they don't use technical words like 'Article' or 'Statute'.\n"
            "2. OUT-OF-SCOPE: Topics that have zero connection to legal, constitutional, or civic matters (e.g., entertainment, recipes, coding, or general science).\n\n"
            "HOW TO RESPOND:\n"
            "- IF IN-SCOPE: Use the 'CONTEXT' provided below if available. If 'CONTEXT' is empty, use your internal expert knowledge of the Indian Legal System to provide a helpful, professional answer. Cite specific Articles or Sections if you know them.\n"
            "- IF OUT-OF-SCOPE: Politely explain that you are a specialized legal assistant and cannot answer that specific question, then briefly list the types of legal topics you CAN help with (e.g., Fundamental Rights, BNS, or police procedures).\n\n"
            "CONTEXT FROM CONSTITUTIONAL DOCUMENTS (May be empty):\n"
            f"{context_text}\n"
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ]
        )
        
        reply = response.choices[0].message.content
        
        # Append professional legal disclaimer and lawyer redirection
        disclaimer = (
            "<br/><br/><hr/>"
            "<div style='margin-top: 15px; padding: 15px; background-color: rgba(255, 193, 7, 0.1); border-left: 4px solid #ffc107; border-radius: 4px; color: #664d03;'>"
            "⚖️ <strong>Disclaimer:</strong> <em>This tool is built for educational purposes only and does not provide legal advice. "
            "For professional legal assistance, please consult a qualified legal professional.</em>"
            "<br/><br/><a href='/connect-lawyer' class='btn btn-warning btn-sm fw-bold' style='text-decoration: none; color: black;'>Connect with Verified Lawyers</a>"
            "</div>"
        )
        reply += disclaimer
        
        # Translate if needed
        if req.lang == "hi":
            try:
                from services.translate import translate_text
                reply = translate_text(reply, "hi")
            except Exception as e:
                print(f"Translation error: {e}")
        
        # Save chat to database
        res = ChatService.save_chat_message(current_user["user_id"], req.message, reply)
        
        return {"reply": reply, "chat_id": res["chat_id"]}
    except Exception as e:
        err_str = str(e).lower()
        print(f"Chat Error: {err_str}")
        
        if "rate_limit_exceeded" in err_str:
            raise HTTPException(status_code=429, detail="Groq API Rate Limit Exceeded.")
        
        if "api_key" in err_str or "unauthorized" in err_str or "401" in err_str:
            raise HTTPException(
                status_code=401, 
                detail="Your AI API key is invalid or expired. Please update backend/.env"
            )
            
        raise HTTPException(status_code=500, detail="The AI service is currently unavailable. Please try again later.")

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

@app.post("/topics")
async def add_topic(req: TopicRequest, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    result = TopicsService.add_topic(req.title, req.description, req.content)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@app.put("/topics/{topic_id}")
async def update_topic(topic_id: str, req: TopicRequest, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    result = TopicsService.update_topic(topic_id, req.title, req.description, req.content)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

@app.delete("/topics/{topic_id}")
async def delete_topic(topic_id: str, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    result = TopicsService.delete_topic(topic_id)
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    return result

class UpdateLawyerProfileRequest(BaseModel):
    phone: str = None
    address: str = None
    city: str = None
    consultation_fee: float = None
    specialization: str = None
    years_of_experience: int = None

# Lawyer Directory & Admin Verification
@app.get("/lawyers")
async def get_lawyers(city: str = None, min_rating: float = 0.0, specialization: str = None, sort: str = None, name: str = None):
    from database import users_collection, reviews_collection
    query = {"role": "lawyer", "is_verified": True}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if specialization:
        query["specialization"] = specialization
    if name:
        query["username"] = {"$regex": name, "$options": "i"}
    
    lawyers = []
    for l in users_collection.find(query):
        lawyer_id = str(l["_id"])
        
        # Calculate average rating
        pipeline = [
            {"$match": {"lawyer_id": lawyer_id}},
            {"$group": {"_id": "$lawyer_id", "avg_rating": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        rating_stats = list(reviews_collection.aggregate(pipeline))
        avg_rating = rating_stats[0]["avg_rating"] if rating_stats else 0.0
        review_count = rating_stats[0]["count"] if rating_stats else 0
        
        if avg_rating < min_rating:
            continue

        lawyers.append({
            "id": lawyer_id,
            "username": l["username"],
            "email": l["email"],
            "phone": l.get("phone"),
            "address": l.get("address"),
            "city": l.get("city"),
            "specialization": l.get("specialization"),
            "consultation_fee": l.get("consultation_fee", 0.0),
            "years_of_experience": l.get("years_of_experience", 0),
            "avg_rating": round(avg_rating, 1),
            "review_count": review_count,
            "is_verified": l.get("is_verified", False)
        })
    
    # Sorting logic
    if sort == "fee_asc":
        lawyers.sort(key=lambda x: x["consultation_fee"])
    elif sort == "exp_desc":
        lawyers.sort(key=lambda x: x["years_of_experience"], reverse=True)
    elif sort == "rating_desc":
        lawyers.sort(key=lambda x: x["avg_rating"], reverse=True)
    else:
        # Default sort by rating
        lawyers.sort(key=lambda x: x["avg_rating"], reverse=True)
        
    return {"lawyers": lawyers}

@app.put("/profile/lawyer")
async def update_lawyer_profile(req: UpdateLawyerProfileRequest, current_user: dict = Depends(check_role(["lawyer"]))):
    from database import users_collection
    from bson import ObjectId
    
    update_data = {}
    if req.phone is not None: update_data["phone"] = req.phone
    if req.address is not None: update_data["address"] = req.address
    if req.city is not None: update_data["city"] = req.city
    if req.consultation_fee is not None: update_data["consultation_fee"] = float(req.consultation_fee)
    if req.specialization is not None: update_data["specialization"] = req.specialization
    if req.years_of_experience is not None: update_data["years_of_experience"] = int(req.years_of_experience)
    
    if not update_data:
        return {"success": True, "message": "No changes requested"}
        
    users_collection.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    # Fetch updated user to return for React state sync
    u = users_collection.find_one({"_id": ObjectId(current_user["user_id"])})
    return {
        "success": True, 
        "message": "Profile updated successfully",
        "user": {
            "user_id": str(u["_id"]),
            "username": u["username"],
            "email": u["email"],
            "role": u["role"],
            "city": u.get("city"),
            "phone": u.get("phone"),
            "address": u.get("address"),
            "specialization": u.get("specialization"),
            "consultation_fee": u.get("consultation_fee"),
            "years_of_experience": u.get("years_of_experience"),
            "is_verified": u.get("is_verified", False)
        }
    }

@app.post("/lawyer/{lawyer_id}/review")
async def add_review(lawyer_id: str, rating: int = Form(...), comment: str = Form(None), current_user: dict = Depends(get_current_user)):
    from database import reviews_collection, Review
    if rating < 1 or rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    review = Review(current_user["user_id"], lawyer_id, rating, comment)
    review_doc = {
        "user_id": review.user_id,
        "lawyer_id": review.lawyer_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at
    }
    reviews_collection.insert_one(review_doc)
    return {"success": True, "message": "Review submitted successfully"}

@app.get("/lawyer/{lawyer_id}/reviews")
async def get_lawyer_reviews(lawyer_id: str):
    from database import reviews_collection
    reviews = []
    for r in reviews_collection.find({"lawyer_id": lawyer_id}).sort("created_at", -1):
        reviews.append({
            "id": str(r["_id"]),
            "user_id": r["user_id"],
            "rating": r["rating"],
            "comment": r.get("comment"),
            "created_at": r["created_at"]
        })
    return {"reviews": reviews}

@app.get("/admin/lawyers")
async def admin_get_lawyers(current_user: dict = Depends(check_role(["admin", "moderator"]))):
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
            "specialization": l.get("specialization"),
            "consultation_fee": l.get("consultation_fee", 0.0),
            "years_of_experience": l.get("years_of_experience", 0),
            "lawyer_id_proof": l.get("lawyer_id_proof"),
            "lawyer_proof_file": l.get("lawyer_proof_file"),
            "is_verified": l.get("is_verified", False)
        })
    return {"lawyers": lawyers}

@app.post("/admin/verify")
async def admin_verify_lawyer(req: VerificationRequest, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    from database import users_collection
    from bson import ObjectId
    result = users_collection.update_one(
        {"_id": ObjectId(req.lawyer_id)},
        {"$set": {"is_verified": req.is_verified}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found")
    return {"success": True, "message": f"Lawyer {'verified' if req.is_verified else 'unverified'} successfully"}

@app.delete("/admin/lawyers/{lawyer_id}")
async def admin_delete_lawyer(lawyer_id: str, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    from database import users_collection
    from bson import ObjectId
    
    result = users_collection.delete_one({"_id": ObjectId(lawyer_id), "role": "lawyer"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lawyer not found or user is not a lawyer")
        
    return {"success": True, "message": "Lawyer removed completely from the system"}

# Person-to-Person Messaging
@app.post("/messages")
async def send_message(
    receiver_id: str = Form(...),
    message: str = Form(""),
    file: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    from database import lawyer_chat_collection, LawyerChatMessage
    import time
    
    file_url = None
    file_name = None
    file_type = None
    
    if file:
        file_bytes = await file.read()
        file_name = file.filename
        file_type = file.content_type
        try:
            public_url = GCSService.upload_file(file_bytes, file_name, file_type)
            file_url = public_url
        except Exception as e:
            # Fallback to local
            file_ext = os.path.splitext(file_name)[1]
            unique_filename = f"{int(time.time())}_{file_name}"
            file_path = os.path.join(UPLOADS_DIR, "chats", unique_filename)
            
            with open(file_path, "wb") as buffer:
                buffer.write(file_bytes)
            
            file_url = f"/uploads/chats/{unique_filename}"
    
    new_msg = LawyerChatMessage(
        sender_id=current_user["user_id"],
        receiver_id=receiver_id,
        message=message,
        file_url=file_url,
        file_name=file_name,
        file_type=file_type
    )
    
    msg_data = {
        "sender_id": new_msg.sender_id,
        "receiver_id": new_msg.receiver_id,
        "message": new_msg.message,
        "file_url": new_msg.file_url,
        "file_name": new_msg.file_name,
        "file_type": new_msg.file_type,
        "timestamp": new_msg.timestamp,
        "is_read": new_msg.is_read
    }
    
    result = lawyer_chat_collection.insert_one(msg_data)
    return {"success": True, "message_id": str(result.inserted_id)}

@app.get("/messages/{other_id}")
async def get_messages(other_id: str, current_user: dict = Depends(get_current_user)):
    from database import lawyer_chat_collection
    
    # Mark messages from other_user to current_user as read
    lawyer_chat_collection.update_many(
        {"sender_id": other_id, "receiver_id": current_user["user_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    
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
            "file_url": msg.get("file_url"),
            "file_name": msg.get("file_name"),
            "file_type": msg.get("file_type"),
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

# Appointments
@app.post("/appointments/book")
async def book_appointment(req: AppointmentRequest, current_user: dict = Depends(get_current_user)):
    from database import appointments_collection, Appointment
    appt = Appointment(current_user["user_id"], req.lawyer_id, req.date, req.time_slot, req.notes)
    appt_doc = {
        "user_id": appt.user_id,
        "lawyer_id": appt.lawyer_id,
        "date": appt.date,
        "time_slot": appt.time_slot,
        "notes": appt.notes,
        "status": appt.status,
        "created_at": appt.created_at
    }
    result = appointments_collection.insert_one(appt_doc)
    return {"success": True, "appointment_id": str(result.inserted_id)}

@app.get("/appointments/user")
async def get_user_appointments(current_user: dict = Depends(get_current_user)):
    from database import appointments_collection, users_collection
    from bson import ObjectId
    query = {"user_id": current_user["user_id"]}
    appts = []
    for a in appointments_collection.find(query).sort("date", 1):
        lawyer = users_collection.find_one({"_id": ObjectId(a["lawyer_id"])})
        appts.append({
            "id": str(a["_id"]),
            "lawyer_id": a["lawyer_id"],
            "lawyer_name": lawyer["username"] if lawyer else "Unknown",
            "date": a["date"],
            "time_slot": a["time_slot"],
            "status": a["status"],
            "notes": a.get("notes")
        })
    return {"appointments": appts}

@app.get("/appointments/lawyer")
async def get_lawyer_appointments(current_user: dict = Depends(check_role(["lawyer", "admin"]))):
    from database import appointments_collection, users_collection
    from bson import ObjectId
    query = {"lawyer_id": current_user["user_id"]}
    appts = []
    for a in appointments_collection.find(query).sort("date", 1):
        user = users_collection.find_one({"_id": ObjectId(a["user_id"])})
        appts.append({
            "id": str(a["_id"]),
            "user_id": a["user_id"],
            "user_name": user["username"] if user else "Unknown",
            "date": a["date"],
            "time_slot": a["time_slot"],
            "status": a["status"],
            "notes": a.get("notes")
        })
    return {"appointments": appts}

@app.post("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, req: StatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    from database import appointments_collection
    from bson import ObjectId
    result = appointments_collection.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": req.status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True, "message": f"Status updated to {req.status}"}

# User Queries (to Admin)
@app.post("/queries")
async def submit_query(req: UserQueryRequest, current_user: dict = Depends(get_current_user)):
    from database import queries_collection, UserQuery
    new_query = UserQuery(current_user["user_id"], req.subject, req.message)
    query_doc = {
        "user_id": new_query.user_id,
        "subject": new_query.subject,
        "message": new_query.message,
        "status": new_query.status,
        "created_at": new_query.created_at
    }
    result = queries_collection.insert_one(query_doc)
    return {"success": True, "query_id": str(result.inserted_id)}

@app.get("/admin/queries")
async def admin_get_queries(current_user: dict = Depends(check_role(["admin", "moderator"]))):
    from database import queries_collection, users_collection
    from bson import ObjectId
    queries = []
    for q in queries_collection.find().sort("created_at", -1):
        user = users_collection.find_one({"_id": ObjectId(q["user_id"])})
        queries.append({
            "id": str(q["_id"]),
            "user_id": q["user_id"],
            "username": user["username"] if user else "Unknown User",
            "email": user["email"] if user else "Unknown Email",
            "subject": q["subject"],
            "message": q["message"],
            "status": q.get("status", "pending"),
            "created_at": q["created_at"].isoformat() if q.get("created_at") else None
        })
    return {"queries": queries}

@app.put("/admin/queries/{query_id}/status")
async def update_query_status(query_id: str, req: StatusUpdateRequest, current_user: dict = Depends(check_role(["admin", "moderator"]))):
    from database import queries_collection, notifications_collection, Notification
    from bson import ObjectId
    
    if req.status not in ["pending", "resolved", "dismissed"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    query = queries_collection.find_one({"_id": ObjectId(query_id)})
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
        
    result = queries_collection.update_one(
        {"_id": ObjectId(query_id)},
        {"$set": {"status": req.status}}
    )
    
    if result.modified_count > 0 and req.status in ["resolved", "dismissed"]:
        notification_msg = f"Your request regarding '{query['subject']}' has been marked as {req.status} by an admin."
        new_notif = Notification(query["user_id"], notification_msg)
        notif_doc = {
            "user_id": new_notif.user_id,
            "message": new_notif.message,
            "is_read": new_notif.is_read,
            "created_at": new_notif.created_at
        }
        notifications_collection.insert_one(notif_doc)
        
    return {"success": True, "message": f"Query status updated to {req.status}"}

# Notifications
@app.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    from database import notifications_collection
    
    notifications = []
    # Get last 20 notifications for user
    for n in notifications_collection.find({"user_id": current_user["user_id"]}).sort("created_at", -1).limit(20):
        notifications.append({
            "id": str(n["_id"]),
            "message": n["message"],
            "is_read": n.get("is_read", False),
            "created_at": n["created_at"].isoformat() if n.get("created_at") else None
        })
        
    return {"notifications": notifications}

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    from database import notifications_collection
    from bson import ObjectId
    
    result = notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user["user_id"]},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"success": True, "message": "Notification marked as read"}

# Speech & Translation endpoints
class SpeechRequest(BaseModel):
    audio_data: str # Base64

class TranslateSpeakRequest(BaseModel):
    text: str
    target_lang: str

@app.post("/speech-to-text")
async def speech_to_text(req: SpeechRequest):
    return SpeechService.speech_to_text(req.audio_data)

@app.post("/text-to-speech")
async def text_to_speech(text: str = Form(...), lang: str = Form("en")):
    return SpeechService.text_to_speech(text, lang)

@app.post("/translate-and-speak")
async def translate_and_speak(req: TranslateSpeakRequest):
    return SpeechService.translate_and_speak(req.text, req.target_lang)

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    from fastapi.responses import FileResponse
    file_path = os.path.join(UPLOADS_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(file_path)


