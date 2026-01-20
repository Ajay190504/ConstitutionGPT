# ConstitutionGPT - Setup Guide for Friends

## 🚀 Quick Start

This guide will help you set up and run ConstitutionGPT on your local machine in under 5 minutes!

## 📋 Prerequisites

Before you start, make sure you have:

1. **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download Node.js](https://nodejs.org/)
3. **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community)
4. **Git** - [Download Git](https://git-scm.com/downloads)

## 📥 Download & Setup

### Step 1: Download the Project
```bash
# Option 1: Clone from GitHub (if you have it)
git clone <repository-url>

# Option 2: Download ZIP
# Extract the downloaded ZIP file to your desired location
```

### Step 2: Navigate to Project Directory
```bash
cd constitution-gpt
```

### Step 3: Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install
```

### Step 5: Environment Configuration
Create a `.env` file in the `backend` directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_jwt_secret_key_here
```

**Get OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/login
3. Navigate to API Keys
4. Create new API key
5. Copy the key

## 🏃 Running the Application

### Start MongoDB
```bash
# Windows: Start MongoDB service from Services
# Or run: mongod
```

### Start Backend Server
```bash
cd backend
venv\Scripts\activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend Server
```bash
# Open NEW terminal
cd frontend
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

## 📱 Using ConstitutionGPT

### 1. Create Account
- Go to http://localhost:5173
- Click "Create an account"
- Fill in username, email, and password
- **Select Role**: Choose "User" or "Lawyer"
  - *Lawyers* must provide phone, city, and office address.
- Click "Create account"

### 2. Login
- Use your credentials to login
- You'll be redirected to the dashboard

### 3. Ask Questions
- Click "Ask" in the sidebar
- Type your question about Indian Constitution
- Click "Ask Question" or press Ctrl+Enter
- Get AI-powered responses

### 4. Browse Topics
- Click "Topics" in the sidebar
- Browse constitutional topics like:
  - Fundamental Rights
  - Directive Principles
  - Fundamental Duties
  - Union Executive
  - Parliament
  - Judiciary

- Click "Delete" to remove conversations

### 6. Connect with Lawyers (Users Only)
- Click "Connect to Lawyer" in the sidebar
- Browse verified legal professionals
- Search by city using the filter bar
- Click "Call" or "Message" to start a consultation

### 7. Administration (Admin Only)
- Log in with Admin credentials (see below)
- Click "Admin Dashboard" to see all registered lawyers
- Toggle "Verify" to make a lawyer visible to users

### 8. Inbox & Messaging
- Click "Inbox Chat" to see all your active person-to-person conversations
- Message lawyers/users directly from their profile or the lawyer directory

## 🔧 Troubleshooting

### Common Issues & Solutions

#### "Failed to fetch" Error
**Problem**: Frontend can't connect to backend
**Solution**: 
1. Make sure backend server is running (check terminal)
2. Verify port 8000 is not blocked
3. Check both servers are in different terminals

#### "ModuleNotFoundError" Error
**Problem**: Missing Python dependencies
**Solution**:
```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

#### "MongoDB connection failed" Error
**Problem**: MongoDB not running
**Solution**:
1. Install MongoDB
2. Start MongoDB service
3. Or use MongoDB Atlas (free cloud option)

#### Port Already in Use
**Problem**: Port 8000 or 5173 is occupied
**Solution**:
```bash
# Backend - use different port
python -m uvicorn main:app --port 8001

# Frontend - edit package.json
# Change "dev" script to use different port
```

## 📁 Project Structure

```
constitution-gpt/
├── backend/
│   ├── main.py              # Main FastAPI application
│   ├── database.py          # MongoDB connection and models
│   ├── requirements.txt      # Python dependencies
│   ├── .env               # Environment variables
│   └── services/           # Business logic
│       ├── auth_service.py     # User authentication
│       ├── chat_service.py     # Chat functionality
│       └── topics_service.py   # Topics management
├── frontend/
│   ├── src/
│   │   ├── pages/           # React components
│   │   └── services/        # API integration
│   ├── package.json        # Node.js dependencies
│   └── index.html          # Main HTML file
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🎯 Features Available

- ✅ **User Authentication** - Secure login/registration
- ✅ **AI Chat** - Ask questions about Indian Constitution
- ✅ **Chat History** - View and manage conversations
- ✅ **Topics Browser** - Learn constitutional topics
- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern UI** - Clean, intuitive interface

## 🔑 Admin Setup

To access the Admin Dashboard, you need an admin account. You can create the default admin or change an existing user's password using the provided scripts:

### Create Default Admin
```bash
cd backend
venv\Scripts\activate
python create_admin.py
```
*Default Credentials: admin / admin123*

### Change Any Password
```bash
python change_password.py <username> <new_password>
```

## 🆘 Getting Help

If you face any issues:

1. **Check this guide** - Most solutions are here
2. **Search online** - Many common issues have solutions
3. **Ask the original developer** - Contact information in project

## 🎉 Ready to Go!

Once both servers are running, you're all set to explore the Indian Constitution with AI assistance!

**Remember**: 
- Backend must run on port 8000
- Frontend must run on port 5173
- MongoDB must be running
- OpenAI API key must be valid

Happy learning! 🇮🇳
