"""
Context API — Smart assistant endpoint.

Returns a complete user profile with:
- Status, urgency, recommendations
- Google Maps polling booth link
- Quick links (NVSP, ECI, etc.)
- Optional AI-powered guidance
"""

from fastapi import APIRouter, Query
from typing import Optional
from services.context_engine import compute_smart_context
from services.ai_service import explain_user_context
from services.next_action_service import compute_next_action

router = APIRouter(prefix="/api/context", tags=["Smart Context"])


@router.get("/")
def get_context(
    age: Optional[int] = Query(None, ge=0, le=150),
    is_citizen: Optional[bool] = Query(None),
    has_voter_id: Optional[bool] = Query(None),
    state: Optional[str] = Query(None, max_length=50),
):
    """
    Compute the full smart context for a user.

    This powers the dynamic dashboard — no two users see the same output.
    """
    result = compute_smart_context(
        age=age,
        is_citizen=is_citizen,
        has_voter_id=has_voter_id,
        state=state,
    )

    # AI guidance (optional, graceful degradation)
    ai_guidance = explain_user_context({
        "status": result["user_status"],
        "status_label": result["user_status_label"],
        "urgency": result["urgency"]["label"],
        "top_recommendation": result["recommendations"][0]["action"] if result["recommendations"] else None,
    })
    result["ai_guidance"] = ai_guidance

    # Next Action Engine
    action = compute_next_action(
        age=age,
        is_citizen=is_citizen,
        has_voter_id=has_voter_id,
    )
    result.update(action)

    return result
