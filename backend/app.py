"""
VoteSarthi — FastAPI Backend
=====================================
Entry point. All business logic lives in services/.
AI is only used for explanations, not decision-making.

AI Provider: Google Gemini (primary) → OpenAI (fallback) → deterministic
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.eligibility import router as eligibility_router
from routes.steps import router as steps_router
from routes.timeline import router as timeline_router
from routes.faq import router as faq_router
from routes.explain import router as explain_router
from routes.context import router as context_router
from routes.documents import router as documents_router
from routes.auth import router as auth_router

app = FastAPI(
    title="VoteSarthi API",
    description="Smart assistant helping Indian citizens understand the election process",
    version="2.0.0",
)

# CORS — allow Next.js frontend (dev + prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://vote-sarthi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(eligibility_router)
app.include_router(steps_router)
app.include_router(timeline_router)
app.include_router(faq_router)
app.include_router(explain_router)
app.include_router(context_router)
app.include_router(documents_router)
app.include_router(auth_router)


@app.get("/api/health")
def health():
    """Health check — reports AI provider status."""
    from services.ai_provider import get_provider_status

    return {
        "status": "ok",
        "version": "2.0.0",
        "ai": get_provider_status(),
    }
