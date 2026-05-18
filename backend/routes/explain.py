from fastapi import APIRouter, Request
from services.limiter import limiter
from models.schemas import ExplainRequest, ExplainResponse
from services.ai_service import explain_eligibility, explain_steps, explain_timeline
from services.steps_service import get_voting_steps
from services.timeline_service import get_timeline

router = APIRouter(prefix="/api/explain", tags=["AI Explanation"])


@router.post("/", response_model=ExplainResponse)
@limiter.limit("5/minute")
def explain(request: Request, req: ExplainRequest):
    """
    Unified AI explanation endpoint.
    Takes context + data and returns a grounded, plain-language explanation.
    AI NEVER decides anything — only explains data provided by the backend.
    """
    explanation = None

    if req.context == "eligibility" and req.eligibility_result:
        explanation = explain_eligibility(
            age=req.age or 0,
            state=req.state or "not specified",
            voter_id_status=req.voter_id_status or "unknown",
            backend_result=req.eligibility_result,
        )

    elif req.context == "steps":
        result = get_voting_steps()
        explanation = explain_steps(
            voter_id_status=req.voter_id_status or "unknown",
            eligibility_status=req.eligibility_status or "unknown",
            steps_data=result["steps"],
        )

    elif req.context == "timeline":
        timeline_data = get_timeline()
        explanation = explain_timeline(timeline_data)

    if explanation:
        return {"explanation": explanation, "source": "ai"}

    # Fallback when AI is unavailable
    fallback_messages = {
        "eligibility": "Check the details above for your eligibility status and next steps.",
        "steps": "Follow the steps shown above in order. Start with step 1.",
        "timeline": "Review the timeline phases above to find your state and date.",
    }
    return {
        "explanation": fallback_messages.get(
            req.context,
            "Please review the information provided above.",
        ),
        "source": "fallback",
    }
