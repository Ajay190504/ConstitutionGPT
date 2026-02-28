# ConstitutionGPT - AI-Powered Indian Constitution Assistant

A full-stack web application that provides AI-powered assistance with the Indian Constitution using OpenAI's GPT models.

## Features

- **User Roles**: Differentiated registration for regular Users and legal Professionals (Lawyers)
- **Lawyer Marketplace**: Verified lawyer directory with city, name, and specialization filtering
- **Advanced Sorting**: Discover lawyers by Fees, Experience, or Ratings
- **Voice AI (V2.0)**: Dictate legal questions and messages using Speech-to-Text 🎙️
- **Secure File Sharing (V2.0)**: Exchange PDFs/Images for case files and documents 📁
- **Consultation Booking (V2.0)**: Full appointment lifecycle (Book -> Accept/Reject -> Complete) 📅
- **Unified Messaging**: Real-time person-to-person chat with document history
- **Admin Dashboard**: Verification system for legal professionals
- [x] **AI Chat (RAG)**: Ask questions about the Indian Constitution and get context-aware answers using a built-in vector database (ChromaDB)
- [x] **Chat History**: View and manage your conversation history
- [x] **Constitutional Topics**: Browse and learn about various constitutional topics
- [x] **Automated Testing**: Comprehensive frontend test suite using Vitest and React Testing Library
- [x] **Modern UI**: Clean, responsive interface built with React, Bootstrap, and Bootstrap Icons

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for user data and chat history
- **OpenAI API**: GPT-4o-mini for intelligent responses
- **JWT**: Secure authentication tokens
- **Vector Search (RAG)**: ChromaDB with Sentence Transformers (all-MiniLM-L6-v2) for free, local embeddings
- **Speech Recognition**: Google Speech-to-Text
- **Text-to-Speech**: Google TTS
- **Translation**: Google Translate API

### Frontend
- **React 18**: Modern JavaScript framework
- **Vite**: Fast build tool
- **Bootstrap 5**: Responsive CSS framework
- **React Router**: Client-side routing
- **Testing**: Vitest, React Testing Library, jsdom

## Quick Start

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Quick Setup (5 minutes)
```bash
# 1. Download and extract project
# 2. cd backend && python -m venv venv && venv\Scripts\activate
# 3. pip install -r requirements.txt
# 4. cd ../frontend && npm install
# 5. Create .env file with OPENAI_API_KEY
# 6. Start MongoDB
# 7. Run backend: python -m uvicorn main:app --port 8000
#    (Note: RAG will initialize from existing topics on first run)
# 8. Run frontend: npm run dev
# 9. Run tests (optional): npm test
# 10. Open http://localhost:5173
```

## Detailed Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and troubleshooting guide
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs (when backend is running)

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (running on localhost:27017)
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file with your credentials:
```env
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_jwt_secret_key_here
```

6. Start the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Running Tests

To run the automated tests for the frontend:
```bash
cd frontend
npm test
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login
3. Start asking questions about the Indian Constitution
4. Browse constitutional topics
5. View your chat history
6. Use speech features for hands-free interaction

## API Endpoints

### Authentication
- `POST /register` - User/Lawyer registration
- `POST /login` - User login
- `GET /verify-token` - Verify JWT token
- `POST /change-password` - Update user password

### Lawyer Marketplace & Admin
- `GET /lawyers` - List verified lawyers (with city filter)
- `GET /admin/lawyers` - List all lawyers (Admin only)
- `POST /admin/verify` - Verify/Revoke lawyer (Admin only)

### Messaging
- `POST /messages` - Send a direct message
- `GET /messages/{other_id}` - Get conversation history
- `GET /chat-inbox` - Get list of active conversations

### Chat
- `POST /chat` - Send a message to ConstitutionGPT
- `GET /history` - Get user chat history
- `GET /chat/{id}` - Get specific chat
- `DELETE /chat/{id}` - Delete chat

### Topics
- `GET /topics` - Get all constitutional topics
- `GET /topics/{id}` - Get specific topic
- `GET /topics/search/{query}` - Search topics

### Speech
- `POST /speech-to-text` - Convert speech to text
- `POST /text-to-speech` - Convert text to speech
- `POST /translate-and-speak` - Translate and speak text
- `GET /audio/{filename}` - Get audio file

## Default Constitutional Topics

The application comes with pre-loaded constitutional topics:
- Fundamental Rights
- Directive Principles
- Fundamental Duties
- Union Executive
- Parliament
- Judiciary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
