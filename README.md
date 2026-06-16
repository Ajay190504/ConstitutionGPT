# ConstitutionGPT - AI-Powered Indian Constitution Assistant

## Overview

ConstitutionGPT is a full-stack AI-powered legal assistance platform designed to help users understand the Indian Constitution through intelligent, context-aware conversations.

The application combines Retrieval-Augmented Generation (RAG), vector search, AI chat, lawyer discovery, secure messaging, consultation booking, file sharing, and admin-based lawyer verification into a single legal-tech platform.

It is built to support regular users, legal professionals, and administrators with role-based access and dedicated workflows.

---

## Features

### AI Constitution Assistant

- Ask questions related to the Indian Constitution
- Get context-aware answers using RAG
- Built-in vector database using ChromaDB
- Constitutional topic browsing
- Chat history management

### User Roles

- User registration and login
- Lawyer registration and verification
- Admin dashboard for lawyer approval
- Role-based access control

### Lawyer Marketplace

- Verified lawyer directory
- Filter lawyers by city, name, and specialization
- Sort lawyers by fees, experience, and ratings
- View lawyer profiles and availability

### Consultation Booking

- Book consultations with verified lawyers
- Lawyers can accept or reject booking requests
- Track appointment status
- Complete consultation lifecycle support

### Messaging System

- Person-to-person messaging between users and lawyers
- Conversation inbox
- Document history support
- Secure file exchange for PDFs and images

### Voice and Language Features

- Speech-to-text for legal questions and messages
- Text-to-speech support
- Translation and voice output support

### Admin Dashboard

- View all registered lawyers
- Verify or revoke lawyer accounts
- Manage platform verification workflow

### Testing

- Frontend test suite using Vitest
- React Testing Library integration
- jsdom-based component testing

---

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Bootstrap 5
- Bootstrap Icons
- Vitest
- React Testing Library
- jsdom

### Backend

- FastAPI
- Python
- MongoDB
- JWT Authentication
- ChromaDB
- Sentence Transformers
- OpenAI API
- Google Speech-to-Text
- Google Text-to-Speech
- Google Translate API

### AI and RAG

- Retrieval-Augmented Generation
- ChromaDB Vector Database
- Sentence Transformers: all-MiniLM-L6-v2
- Context-aware AI response generation

---

## Project Structure

```text
ConstitutionGPT/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── related backend files
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── related frontend files
│
├── SETUP_GUIDE.md
└── README.md
```

---

## Prerequisites

Before running this project, make sure the following are installed:

- Python 3.8 or above
- Node.js 16 or above
- MongoDB
- OpenAI API key

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment:

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=your_jwt_secret_key_here
MONGODB_URI=mongodb://localhost:27017
```

Start the backend server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at:

```text
http://localhost:8000
```

API documentation will be available at:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

## Running Tests

To run frontend tests:

```bash
cd frontend
npm test
```

---

## Main API Endpoints

### Authentication

```text
POST /register
POST /login
GET /verify-token
POST /change-password
```

### Lawyer Marketplace and Admin

```text
GET /lawyers
GET /admin/lawyers
POST /admin/verify
```

### Messaging

```text
POST /messages
GET /messages/{other_id}
GET /chat-inbox
```

### AI Chat

```text
POST /chat
GET /history
GET /chat/{id}
DELETE /chat/{id}
```

### Constitutional Topics

```text
GET /topics
GET /topics/{id}
GET /topics/search/{query}
```

### Speech Features

```text
POST /speech-to-text
POST /text-to-speech
POST /translate-and-speak
GET /audio/{filename}
```

---

## Default Constitutional Topics

The application includes preloaded constitutional topics such as:

- Fundamental Rights
- Directive Principles of State Policy
- Fundamental Duties
- Union Executive
- Parliament
- Judiciary

---

## Usage

1. Start MongoDB.
2. Run the backend server.
3. Run the frontend development server.
4. Open the application in the browser.
5. Register as a user or lawyer.
6. Ask questions about the Indian Constitution.
7. Browse constitutional topics.
8. Connect with verified lawyers.
9. Use messaging, booking, voice, and file sharing features.

---

## Key Learning Outcomes

This project demonstrates practical implementation of:

- Full-stack web application development
- REST API development using FastAPI
- React-based frontend development
- JWT authentication
- Role-based access control
- MongoDB database integration
- AI-powered question answering
- Retrieval-Augmented Generation
- Vector database integration
- Secure user workflows
- Frontend testing
- Legal-tech platform architecture

---

## Future Enhancements

- Online payment integration for consultations
- Video consultation support
- Advanced lawyer rating system
- Case management dashboard
- Legal document summarization
- Multi-language constitutional assistant
- Mobile application version
- Production deployment with cloud storage

---

## Disclaimer

ConstitutionGPT is developed for educational and informational purposes only. The responses generated by the AI system should not be considered official legal advice. Users should consult qualified legal professionals for legal decisions or formal legal guidance.

---

## Author

Ajay D. Waghmare

B.Tech Computer Science & Engineering

Java Full Stack Developer | AI Developer | Legal-Tech Project Developer

