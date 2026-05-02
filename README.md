# 🗳️ VoteSarthi

**VoteSarthi** is an intelligent election assistant web application that helps users understand the voting process in India through personalized guidance, step-by-step instructions, and interactive tools.

---

## 🚀 Features

### ✅ Core Features

* **Eligibility Checker**
  Check if a user is eligible to vote based on age and voter ID status.

* **Guided Voting Steps**
  Personalized step-by-step process to prepare for voting.

* **Election Timeline**
  Visual representation of election phases with current status.

* **Next Action Engine**
  Clearly tells users what they should do next.

---

### 🧠 Smart Features

* **AI-Powered Explanation**
  Simplifies complex election information into easy language.

* **Simulation Mode**
  Walkthrough of voting day process.

* **What-If Scenarios**
  Handles cases like lost voter ID, relocation, etc.

---

### 🛠 Utility Features

* **Polling Booth Finder**
  Helps users locate their voting booth.

* **Documents Guide**
  Required documents and instructions.

* **FAQ Assistant**
  Quick answers to common questions.

---

## 🧱 Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** FastAPI (Python)
* **AI:** OpenAI API

---

## 📁 Project Structure

```bash
Election-Assistant/
│
├── frontend/    # Next.js frontend
├── backend/     # FastAPI backend
├── README.md
```
```
## 🧠 Architecture

This project follows a layered architecture:

* Frontend (Next.js)
* Backend (FastAPI)
* Services Layer (business logic)
* AI Layer (OpenAI integration)

📄 Full details: [ARCHITECTURE.md](./ARCHITECTURE.md)
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/VoteSarthi.git
cd VoteSarthi
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

---

## 🔐 Environment Variables

Create `.env.local` inside `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🌐 Data Source

Election-related data is aligned with
Election Commission of India

---

## 🎯 Purpose

VoteSarthi aims to:

* Simplify the voting process
* Help first-time voters
* Provide clear guidance and next steps
* Reduce confusion around elections

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Developed by **Raj Kumar**

---

## ⭐ Future Enhancements

* Multi-language support
* Notifications & reminders
* Advanced personalization
* Mobile app version
