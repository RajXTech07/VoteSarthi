# 🧠 VoteSarthi Architecture

This document describes the system architecture and data flow of the VoteSarthi application.

---

## 🏗️ High-Level Architecture

```
User (Browser)
   ↓
Frontend (Next.js)
   ↓
Backend API (FastAPI)
   ↓
Services Layer (Business Logic)
   ↓
Data Layer (Static JSON / DB)
   ↓
AI Layer (OpenAI API)
```

---

## 🧩 Components Overview

### 1. Frontend (Next.js)

Responsible for:

* UI rendering
* User interaction
* API communication

Key modules:

* Dashboard
* Eligibility Page
* Steps Page
* Timeline Page
* Simulation
* FAQ

---

### 2. Backend (FastAPI)

Acts as API layer.

Handles:

* Routing
* Request validation
* Response formatting

---

### 3. Services Layer

Core business logic:

* **eligibility_service**

  * Determines if user can vote

* **steps_service**

  * Filters and returns relevant steps

* **timeline_service**

  * Provides election phase data

* **faq_service**

  * Handles FAQ retrieval

* **explain_service**

  * Connects with AI for explanations

---

### 4. Data Layer

Currently:

* Static JSON / predefined data

Future:

* PostgreSQL or external APIs

---

### 5. AI Layer

Uses OpenAI API for:

* Explanation generation
* Simplifying outputs
* Enhancing user understanding

Important:

* AI does NOT make decisions
* Backend logic remains deterministic

---

## 🔄 Data Flow

1. User inputs data (age, voter ID, etc.)
2. Frontend sends request to backend
3. Backend processes logic via services
4. Data retrieved from storage
5. AI optionally enhances response
6. Response returned to frontend
7. UI displays structured result

---

## 🔐 Security Considerations

* No sensitive data stored
* API keys stored in environment variables
* Frontend uses only safe public variables

---

## ⚡ Scalability

Future improvements:

* Database integration
* Caching (Redis)
* Authentication system
* Multi-language support

---

## 🎯 Design Principles

* Simplicity over complexity
* Deterministic logic for critical decisions
* AI only for explanation
* User-first design
