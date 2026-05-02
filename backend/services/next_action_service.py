"""
Next Action Engine — Single source of truth for "what do I do now?"

Every API response includes a next_action so no screen ever leaves
the user without clear guidance.

Decision tree (deterministic, no AI):
  age < 18          → "Wait till 18; prepare documents"
  eligible & no ID  → "Apply for voter ID on NVSP"
  has ID            → "Check your polling booth / voting date"

The function also produces:
  - next_action       : one-line directive
  - next_action_detail: brief explanation
  - next_action_url   : helpful link (optional)
  - next_action_icon  : emoji hint for the frontend
"""


def compute_next_action(
    age: int | None = None,
    is_citizen: bool | None = None,
    has_voter_id: bool | None = None,
) -> dict:
    """
    Pure function. Returns a dict with keys:
      next_action, next_action_detail, next_action_url, next_action_icon
    """

    # ── Not an Indian citizen ─────────────────────────────────
    if is_citizen is False:
        return {
            "next_action": "Verify your citizenship status",
            "next_action_detail": (
                "Only Indian citizens can vote. If you believe this is "
                "incorrect, contact your nearest District Election Office."
            ),
            "next_action_url": "https://eci.gov.in",
            "next_action_icon": "🚫",
        }

    # ── Under 18 ──────────────────────────────────────────────
    if age is not None and age < 18:
        return {
            "next_action": "Wait till you turn 18 — prepare your documents now",
            "next_action_detail": (
                "You need to be 18+ on the qualifying date (Jan 1 of the "
                "electoral roll revision year). Meanwhile, keep your Aadhaar, "
                "school ID, and address proof ready."
            ),
            "next_action_url": "https://voters.eci.gov.in",
            "next_action_icon": "⏳",
        }

    # ── Eligible but no Voter ID ──────────────────────────────
    if has_voter_id is False:
        return {
            "next_action": "Apply for your Voter ID (EPIC) on NVSP",
            "next_action_detail": (
                "Register online at the National Voter Service Portal. "
                "Fill Form 6 and upload your photo, age proof, and address proof. "
                "It takes about 2-4 weeks."
            ),
            "next_action_url": "https://voters.eci.gov.in/login",
            "next_action_icon": "📝",
        }

    # ── Has Voter ID ──────────────────────────────────────────
    if has_voter_id is True:
        return {
            "next_action": "Check your polling booth and voting date",
            "next_action_detail": (
                "Download the Voter Helpline app or visit the ECI website "
                "to find your polling station, verify your name in the "
                "electoral roll, and know your voting date."
            ),
            "next_action_url": "https://voters.eci.gov.in",
            "next_action_icon": "🗳️",
        }

    # ── No context at all (homepage / generic) ────────────────
    return {
        "next_action": "Check if you're eligible to vote",
        "next_action_detail": (
            "Use the Eligibility Checker to find out your voter status "
            "and get a personalized action plan in under 30 seconds."
        ),
        "next_action_url": None,
        "next_action_icon": "🔍",
    }
