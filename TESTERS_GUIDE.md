# 🧪 ConstitutionGPT V2.0 - Tester's Guide

This guide is designed for the quality assurance (QA) and testing phase of ConstitutionGPT V2.0. Follow these steps to explore the full feature set.

---

## 🛠️ 1. Setup & Launch
1. Ensure **MongoDB** is running locally.
2. **Backend**:
   - `cd backend`
   - `venv\Scripts\activate`
   - `python -m uvicorn main:app --reload`
3. **Frontend**:
   - `cd frontend`
   - `npm run dev`
4. Open your browser to `http://localhost:5173`.

---

## 🧪 2. Test Scenarios

### 👤 Scenario A: The Regular Citizen (User)
1. **Register** as a "Regular Citizen".
2. **AI Search**: Go to "Ask AI". Click the 🎙️ icon and say "What are my Fundamental Rights?". Verify the AI transcribes and answers with citations.
3. **Discovery**: Go to "Connect Lawyer".
   - Search by name (e.g., "Ajay").
   - Filter by city or specialization.
   - **Sort** by "Fee: Low to High".
4. **Booking**: Click "Book" on a lawyer. Pick a date and time. Add a note.
5. **Messaging**: Open a chat with a lawyer. Send a text message, then click 📎 to send a "Case Statement" (PDF/Image).

### ⚖️ Scenario B: The Legal Professional (Lawyer)
1. **Register** as a "Legal Professional". *Note: You will need an Admin to verify you before you appear in the directory.*
2. **Verification (Admin Mode)**:
   - Log out and log in as an **Admin** (or create an admin user in DB).
   - Go to "Admin Dashboard".
   - View the lawyer's uploaded ID proof. Click **"Verify"**.
3. **Profile Management**:
   - Log back in as the **Lawyer**.
   - Go to "My Profile" -> "Edit Details".
   - Change your Consultation Fee or Experience. **Save** and verify changes.
4. **Appointment Management**:
   - Go to "Client Appointments".
   - Find the User's request. Click **"Accept"**.
   - After testing, click **"Complete"**.
5. **Interactive Chat**: Respond to the User's message and send back a "Bill" or "NOC" file.

---

## 🐞 3. What to Look For
- **Real-time Updates**: Do status changes (Pending -> Confirmed) reflect instantly?
- **Syncing**: Does the Profile change immediately update the Lawyer Directory?
- **Responsiveness**: Does the UI look good on both Desktop and smaller screens?
- **AI Accuracy**: Does the AI always provide Article/Section citations?

---

**Happy Testing!** 🚀
*If you find any bugs, please document the steps to reproduce them.*
