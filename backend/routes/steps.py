from fastapi import APIRouter, Query
from typing import Optional
from services.steps_service import get_voting_steps
from services.ai_service import explain_steps
from services.next_action_service import compute_next_action

router = APIRouter(prefix="/api/steps", tags=["Voting Steps"])


@router.get("/")
def steps(
    age: Optional[int] = Query(None, ge=0, le=150, description="User's age"),
    has_voter_id: Optional[bool] = Query(None, description="Whether user has a Voter ID"),
):
    """
    Return the step-by-step voting guide, personalized by context.

    - No params → all steps (backward compatible)
    - age < 18 → underage guidance
    - has_voter_id=false → registration + voting steps
    - has_voter_id=true → preparation + voting steps (skip registration)

    Personalization guarantee: User A (no ID) and User B (has ID)
    get completely different step sequences.
    """
    result = get_voting_steps(age=age, has_voter_id=has_voter_id)

    # AI summary — simplified bullets (optional, graceful degradation)
    if result.get("personalized") and result.get("steps"):
        voter_id_status = "has Voter ID" if has_voter_id else "no Voter ID"
        eligibility_status = "underage" if (age is not None and age < 18) else "eligible"
        ai_text = explain_steps(
            voter_id_status=voter_id_status,
            eligibility_status=eligibility_status,
            steps_data=result["steps"],
        )
        result["ai_summary"] = ai_text
    else:
        result["ai_summary"] = None

    # Next Action Engine
    action = compute_next_action(age=age, has_voter_id=has_voter_id)
    result.update(action)

    return result
