import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def _load(filename: str) -> dict:
    """Load a JSON data file from the data directory."""
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def check_eligibility(age: int, has_voter_id: bool, is_citizen: bool) -> dict:
    """
    Deterministic eligibility check — no AI.
    Returns { eligible, reasons, next_steps }.
    """
    rules = _load("eligibility_rules.json")
    reasons = []
    next_steps = []
    eligible = True

    # Citizenship check
    if not is_citizen:
        eligible = False
        reasons.append(rules["requirements"]["is_citizen"]["fail_message"])
        next_steps.append(rules["requirements"]["is_citizen"]["help"])

    # Age check
    if age < rules["minimum_age"]:
        eligible = False
        reasons.append(rules["requirements"]["age"]["fail_message"])
        next_steps.append(rules["requirements"]["age"]["help"])

    # Voter ID check (not a blocker, but flagged)
    if not has_voter_id:
        reasons.append(rules["requirements"]["has_voter_id"]["fail_message"])
        next_steps.extend(rules["registration_steps"])

    # All good
    if eligible and has_voter_id:
        reasons.append("You are eligible to vote! ✅")
        next_steps.append("Check your name in the electoral roll before election day.")
        next_steps.append("Find your polling booth using the Voter Helpline App.")

    return {
        "eligible": eligible,
        "reasons": reasons,
        "next_steps": next_steps,
    }
