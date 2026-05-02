from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.timeline_service import get_timeline, get_personal_timeline
from services.ai_service import explain_timeline
from services.next_action_service import compute_next_action

router = APIRouter(prefix="/api/timeline", tags=["Election Timeline"])

class PersonalTimelineRequest(BaseModel):
    age: int = Field(..., ge=0, le=150)
    has_voter_id: bool
    state: str = Field(default="")



@router.get("/")
def timeline():
    """Return the election timeline with AI-explained context."""
    result = get_timeline()

    # AI explanation — "what this means now" (optional, graceful degradation)
    ai_text = explain_timeline(result)
    result["ai_summary"] = ai_text

    # Next Action Engine — generic context (no user info on this page)
    action = compute_next_action()
    result.update(action)

    return result

@router.post("/personal")
def personal_timeline(req: PersonalTimelineRequest):
    """Return a personalized election timeline."""
    result = get_personal_timeline(req.age, req.has_voter_id, req.state)
    result["ai_summary"] = explain_timeline(result)
    # Generic for now, but could be personalized
    action = compute_next_action()
    result.update(action)
    return result
