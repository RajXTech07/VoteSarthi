import json
from datetime import date
from pathlib import Path

from services.ai_provider import call_ai

DATA_DIR = Path(__file__).parent.parent / "data"


# ══════════════════════════════════════════════════════════
# 1. ELIGIBILITY EXPLAINER
# ══════════════════════════════════════════════════════════

def explain_eligibility(
    age: int,
    state: str,
    voter_id_status: str,
    backend_result: dict,
) -> str | None:
    """Short explanation of eligibility result. 80–120 words max."""
    prompt = (
        f"User: age {age}, state {state}, {voter_id_status}\n\n"
        f"Backend Result:\n{json.dumps(backend_result, indent=2)}\n\n"
        "Write a short explanation (80–120 words) with:\n"
        "• **Status**: eligible or not (1 line)\n"
        "• **Why**: the reason (1-2 lines)\n"
        "• **Do this now**: the single most important next action\n\n"
        "Use bullet points. Do NOT add information beyond the backend result."
    )
    return call_ai(prompt)


# ══════════════════════════════════════════════════════════
# 2. STEPS SIMPLIFIER
# ══════════════════════════════════════════════════════════

def explain_steps(
    voter_id_status: str,
    eligibility_status: str,
    steps_data: list[dict],
) -> str | None:
    """Simplified bullet summary of personalized steps. 80–120 words max."""
    simplified = [
        {"step": s.get("step_number", s["id"]), "title": s["title"]}
        for s in steps_data
    ]

    prompt = (
        f"User: {voter_id_status}, {eligibility_status}\n\n"
        f"Personalized steps (already filtered by backend):\n"
        f"{json.dumps(simplified, indent=2)}\n\n"
        "Summarize these steps in 80–120 words:\n"
        f"• Start with: 'Your {len(simplified)}-step path:'\n"
        "• One bullet per step — action words only\n"
        "• Bold the FIRST step (most urgent)\n"
        "• End with one practical tip\n\n"
        "Do NOT add steps that aren't in the list."
    )
    return call_ai(prompt)


# ══════════════════════════════════════════════════════════
# 3. TIMELINE EXPLAINER
# ══════════════════════════════════════════════════════════

def explain_timeline(timeline_data: dict) -> str | None:
    """Explains what the current election phase means. 80–120 words max."""
    current_date = date.today().isoformat()
    current_idx = timeline_data.get("current_phase_index")
    current_action = timeline_data.get("current_action", "No active phase")

    if current_idx is not None:
        phase = timeline_data["phases"][current_idx]
        context = (
            f"Active phase: Phase {phase['phase']}\n"
            f"Date: {phase['date']}\n"
            f"States: {', '.join(phase['states'][:5])}...\n"
            f"Seats: {phase['seats']}\n"
            f"Current action: {current_action}"
        )
    else:
        context = (
            f"All {timeline_data.get('total_phases', 7)} phases completed.\n"
            f"Result date: {timeline_data.get('result_date', 'TBD')}\n"
            f"Current action: {current_action}"
        )

    prompt = (
        f"Today: {current_date}\n\n"
        f"Election Status:\n{context}\n\n"
        "Write 'What this means for you now' in 80–120 words:\n"
        "• **Right now**: what phase we're in (1 line)\n"
        "• **What to do**: specific action for the user\n"
        "• **Key date**: next important deadline\n\n"
        "Use bullet points. Be specific, not generic."
    )
    return call_ai(prompt)


# ══════════════════════════════════════════════════════════
# 4. SMART CONTEXT EXPLAINER
# ══════════════════════════════════════════════════════════

def explain_user_context(context_data: dict) -> str | None:
    """Personalized guidance based on full user context. 80–120 words max."""
    prompt = (
        f"User context:\n{json.dumps(context_data, indent=2)}\n\n"
        "Write a personalized 80–120 word guidance:\n"
        "• **Your status**: 1-line summary of where they stand\n"
        "• **Do this now**: the single most important action\n"
        "• **Why it matters**: brief motivation\n"
        "• **Quick tip**: one practical shortcut\n\n"
        "Be warm but direct. Use 'you' language."
    )
    return call_ai(prompt)


# ══════════════════════════════════════════════════════════
# 5. FAQ ANSWERER
# ══════════════════════════════════════════════════════════

def _load_faqs() -> list[dict]:
    """Load stored FAQ data."""
    with open(DATA_DIR / "faq_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["faqs"]


def _find_best_match(question: str, faqs: list[dict]) -> dict | None:
    """Keyword matching to find the most relevant FAQ."""
    question_lower = question.lower()
    best_match = None
    best_score = 0

    for faq in faqs:
        score = sum(1 for kw in faq["keywords"] if kw in question_lower)
        if score > best_score:
            best_score = score
            best_match = faq

    return best_match if best_score > 0 else None


def _ai_explain_faq(user_query: str, faq_matches: list[dict]) -> str | None:
    """AI-simplified FAQ answer. 80–120 words max."""
    simplified = [
        {"question": f["question"], "answer": f["answer"]}
        for f in faq_matches
    ]

    prompt = (
        f"User asked: {user_query}\n\n"
        f"Matched FAQ data:\n{json.dumps(simplified, indent=2)}\n\n"
        "Answer in 80–120 words:\n"
        "• Direct answer first (1-2 lines)\n"
        "• Key details as bullet points\n"
        "• End with a practical next step if relevant\n\n"
        "Use ONLY the provided FAQ data. Do NOT guess."
    )
    return call_ai(prompt)


def get_faq_answer(question: str) -> dict:
    """
    Main FAQ handler:
    1. Search stored FAQs for a match
    2. If found, optionally simplify with AI
    3. If not found, return a helpful fallback
    """
    faqs = _load_faqs()
    match = _find_best_match(question, faqs)

    if not match:
        return {
            "answer": (
                "I'm not sure about that. Please try asking about voter "
                "registration, eligibility, EVMs, NOTA, or the voting process. "
                "You can also check the official website: "
                "https://voters.eci.gov.in"
            ),
            "source": "fallback",
            "matched_question": None,
        }

    stored_answer = match["answer"]

    # Try AI explanation (graceful degradation)
    ai_answer = _ai_explain_faq(question, [match])

    if ai_answer:
        return {
            "answer": ai_answer,
            "source": "ai_explained",
            "matched_question": match["question"],
        }

    return {
        "answer": stored_answer,
        "source": "stored",
        "matched_question": match["question"],
    }
