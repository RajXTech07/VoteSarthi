from fastapi import APIRouter
from models.schemas import EligibilityRequest, EligibilityResponse
from services.eligibility_service import check_eligibility
from services.ai_service import explain_eligibility
from services.next_action_service import compute_next_action

router = APIRouter(prefix="/api/eligibility", tags=["Eligibility"])


@router.post("/check", response_model=EligibilityResponse)
def check(req: EligibilityRequest):
    """
    Check if a user is eligible to vote based on age, citizenship, and voter ID.
    The eligibility decision is 100% deterministic (no AI).
    AI only provides an optional plain-language explanation of the result.
    """
    # Step 1: Deterministic eligibility check (no AI)
    result = check_eligibility(
        age=req.age,
        has_voter_id=req.has_voter_id,
        is_citizen=req.is_citizen,
    )

    # Step 2: Optional AI explanation (graceful degradation)
    voter_id_status = "has Voter ID" if req.has_voter_id else "no Voter ID"
    ai_text = explain_eligibility(
        age=req.age,
        state=req.state or "not specified",
        voter_id_status=voter_id_status,
        backend_result=result,
    )

    result["ai_explanation"] = ai_text

    # Step 3: Next Action Engine
    action = compute_next_action(
        age=req.age,
        is_citizen=req.is_citizen,
        has_voter_id=req.has_voter_id,
    )
    result.update(action)

    return result
