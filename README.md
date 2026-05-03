# 🗳️ VoteSarthi

**VoteSarthi** is a smart election assistant web application that helps Indian citizens understand the voting process through personalized guidance, step-by-step instructions, and interactive tools.

🌐 **Live Demo:** https://vote-sarthi.vercel.app
⚙️ **Backend API:** https://votesarthi.onrender.com

---

## 🚀 Problem Statement

Many eligible voters skip voting due to:

* Lack of clarity about eligibility
* Confusion around the voting process
* Missing or unclear documentation
* No guidance for edge cases (lost ID, relocation, etc.)

**VoteSarthi solves this by providing clear, actionable, and personalized guidance.**

---

## ✨ Key Features

### 🔹 Core Features

* ✅ **Eligibility Checker** (rule-based, deterministic)
* 📋 **Personalized Voting Steps**
* 📅 **Election Timeline Viewer**
* 📍 **Google Maps polling booth**
* 📄 **Required Documents Guide**
* ❓ **FAQ Assistant**

---

### 🧠 Smart Features

* 🤖 **AI-Powered Explanation Engine** (simplifies complex election info)
* 🎯 **Next Action Engine** (tells user what to do next)
* 🔍 **Context-Based Guidance**

---

### 🧪 Advanced Features

* 🔄 **What-If Scenarios** (lost voter ID, relocation, etc.)
* 📍 **Polling Booth Finder (in progress)**
* 🔐 **Google Authentication (in progress)**

---

## 🧱 Tech Stack

### Frontend

* **Next.js (React)**
* CSS Modules / Custom UI Components

### Backend

* **FastAPI (Python)**
* RESTful API architecture

### AI Integration

* Google Gemini API (for explanation & assistance)

### Deployment

* **Frontend:** Vercel
* **Backend:** Render

---

## 🏗️ Project Architecture

```
VoteSarthi/
│
├── frontend/        # Next.js application
│   ├── src/app/
│   ├── components/
│   └── lib/api.js
│
├── backend/         # FastAPI application
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── data/
│
└── README.md
```

## 🧠 Architecture

📄 Detailed system design:
👉 [View Architecture](./ARCHITECTURE.md)


---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/RajXTech07/VoteSarthi.git
cd VoteSarthi
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Environment Variables

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Backend (`.env`)

```env
GEMINI_API_KEY=your_openai_api_key
```

---

## 🔐 Google Authentication (WIP)

Google OAuth is currently under development.

Steps being implemented:

* Google Identity Services integration
* OAuth client setup via Google Cloud Console
* Domain authorization for production (Vercel)

---

## 🧪 Testing (Planned)

* Backend API testing with pytest
* Frontend component testing with Jest

---

## 📈 Future Improvements

* 🌐 Multi-language support (Hindi + regional)
* 📊 User analytics integration
* 🔔 Notification & reminder system
* 📱 Mobile-first UI improvements

---

## 🎯 Purpose

VoteSarthi aims to:

* Simplify the voting process
* Help first-time voters
* Reduce confusion and misinformation
* Provide actionable, real-time guidance

---

## 👨‍💻 Author

**Raj Kumar**
B.Tech CSE Student | Ai Engineer

---

## 📜 License

MIT License
