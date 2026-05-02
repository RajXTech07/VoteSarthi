from fastapi import APIRouter
from models.schemas import FAQRequest, FAQResponse
from services.ai_service import get_faq_answer
from services.next_action_service import compute_next_action

router = APIRouter(prefix="/api/faq", tags=["FAQ"])


@router.post("/", response_model=FAQResponse)
def faq(req: FAQRequest):
    """Answer a user's election-related question using stored data + optional AI."""
    result = get_faq_answer(req.question)

    # Next Action Engine — generic context for FAQ
    action = compute_next_action()
    result.update(action)

    return result
