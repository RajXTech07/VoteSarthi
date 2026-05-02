from pydantic import BaseModel, Field
from typing import Optional


# ── Next Action (returned by every API) ──────────────────────

class NextAction(BaseModel):
    """Single directive telling the user what to do right now."""
    next_action: str
    next_action_detail: str
    next_action_url: Optional[str] = None
    next_action_icon: str = "🔍"


# ── Eligibility ──────────────────────────────────────────────

class EligibilityRequest(BaseModel):
    age: int = Field(..., ge=0, le=150, description="Age of the user")
    has_voter_id: bool = Field(..., description="Whether user has a Voter ID (EPIC)")
    is_citizen: bool = Field(..., description="Whether user is an Indian citizen")
    state: str = Field(default="", description="User's state (optional, for AI context)")


class EligibilityResponse(BaseModel):
    eligible: bool
    reasons: list[str]
    next_steps: list[str]
    ai_explanation: Optional[str] = None  # AI-simplified summary (None if AI unavailable)
    # Next Action Engine
    next_action: str
    next_action_detail: str
    next_action_url: Optional[str] = None
    next_action_icon: str = "🔍"


# ── FAQ ──────────────────────────────────────────────────────

class FAQRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=500)


class FAQResponse(BaseModel):
    answer: str
    source: str  # "stored", "ai_explained", or "fallback"
    matched_question: Optional[str] = None
    # Next Action Engine
    next_action: str
    next_action_detail: str
    next_action_url: Optional[str] = None
    next_action_icon: str = "🔍"


# ── Explain (unified AI explanation endpoint) ────────────────

class ExplainRequest(BaseModel):
    """
    Unified request for AI explanations across all features.
    The 'context' field determines which prompt template is used.
    """
    context: str = Field(
        ...,
        description="One of: eligibility, steps, timeline",
    )
    # Eligibility context
    age: Optional[int] = None
    state: Optional[str] = None
    voter_id_status: Optional[str] = None
    eligibility_result: Optional[dict] = None
    # Steps context
    eligibility_status: Optional[str] = None


class ExplainResponse(BaseModel):
    explanation: str
    source: str  # "ai" or "fallback"

