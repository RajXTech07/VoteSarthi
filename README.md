# 🗳️ VoteSarthi

**VoteSarthi** is an intelligent election assistant that helps users understand the voting process in India through personalized guidance, clear steps, and interactive tools.

The goal is simple:
👉 **Remove confusion and tell users exactly what to do next to vote.**

---

## 🚀 Why VoteSarthi?

Many users—especially first-time voters—struggle with:

* Eligibility confusion
* Registration process
* Voting steps
* Election timelines

VoteSarthi solves this by acting as a **step-by-step guide**, not just an information app.

---

## ✨ Key Features

### 🟢 1. Eligibility Checker

* Determines if a user can vote
* Based on:

  * Age
  * Voter ID status

👉 Provides a clear **status + next action**

---

### 🪜 2. Guided Voting Steps

* Personalized step-by-step process
* Filters steps based on user condition
* Avoids showing unnecessary information

---

### 📅 3. Election Timeline

* Displays election phases
* Highlights **current phase**
* Explains what it means for the user

---

### 🎯 4. Next Action Engine (Core Feature)

* Tells user exactly:

  > “What should I do now?”

Examples:

* Apply for voter ID
* Check polling booth
* Wait until eligible

---

### 🧠 5. AI-Powered Explanation

* Converts complex election info into simple language
* Used for:

  * Eligibility explanation
  * Step simplification
  * Timeline interpretation

---

### 🎮 6. Simulation Mode

* Walkthrough of voting day
* Helps users understand:

  * what happens at polling booth
  * how voting works

---

### 🔄 7. What-If Scenarios

Handles real-life situations like:

* Lost voter ID
* Moving to another city
* Name missing from voter list

---

### 📍 8. Polling Booth Finder

* Helps users locate where to vote

---

### 📄 9. Documents Guide

* Lists required documents
* Explains what is accepted

---

### ❓ 10. FAQ Assistant

* Answers common election-related questions
* Uses structured data + AI explanation

---

## 🧱 Tech Stack

### Frontend

* **Next.js (React)**
* Modern component-based UI

### Backend

* **FastAPI (Python)**
* Clean API-based architecture

### AI Integration

* **Gemini API**
* Used only for explanation (not decision-making)

---

## 🧠 Architecture

📄 Detailed system design:
👉 [View Architecture](./ARCHITECTURE.md)

---

## 📁 Project Structure

```bash
VoteSarthi/
│
├── frontend/        # Next.js application (UI)
├── backend/         # FastAPI server (logic & APIs)
│   ├── routes/      # API endpoints
│   ├── services/    # Business logic
│   ├── data/        # Static datasets
│   └── models/      # Schemas
│
├── README.md
├── ARCHITECTURE.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/VoteSarthi.git
cd VoteSarthi
```

---

## 🔧 Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### ▶ Run backend

```bash
python -m uvicorn app:app --reload
```

Server runs at:

```
http://127.0.0.1:8000
```

---

## 🎨 Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend `.env`
```

```

---


---

## 🔄 Data Flow

1. User enters details
2. Frontend sends request to backend
3. Backend processes logic
4. AI enhances explanation (optional)
5. Response sent back to frontend
6. UI displays structured guidance

---

## 🎯 Design Principles

* **Clarity over complexity**
* **Action-oriented responses**
* **Deterministic backend logic**
* **AI used only for explanation**
* **User-first experience**

---


---

## 🌐 Data Source

Election-related logic is aligned with:
**Election Commission of India**

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Raj**

---

## 🚀 Future Improvements

* Multi-language support
* Notifications & reminders
* Better personalization
* Mobile app version

---

## ⭐ Final Note

VoteSarthi is not just an informational app.
It is designed to act as a **decision assistant**, helping users confidently complete the voting process.
