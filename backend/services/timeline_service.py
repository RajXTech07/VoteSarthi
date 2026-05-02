"""
Timeline Service — Computes current phase by date.

The status of each phase is computed dynamically:
- completed: today > end_date
- active: date <= today <= end_date
- upcoming: today < date

Also identifies the current_phase_index for the frontend to highlight.
"""

import json
from datetime import date
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def get_timeline() -> dict:
    """
    Return the election timeline with dynamically computed phase statuses.

    Adds to each phase:
    - status: "completed" | "active" | "upcoming"

    Adds to the response:
    - current_phase_index: index of the active phase (or None if all done)
    - current_action: what the user should do right now
    """
    with open(DATA_DIR / "election_timeline.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    today = date.today()
    current_phase_index = None
    current_action = None

    for i, phase in enumerate(data["phases"]):
        phase_date = date.fromisoformat(phase["date"])
        end_date = date.fromisoformat(phase.get("end_date", phase["date"]))

        if today > end_date:
            phase["status"] = "completed"
        elif today >= phase_date:
            phase["status"] = "active"
            current_phase_index = i
            current_action = phase.get("user_action")
        else:
            phase["status"] = "upcoming"
            # If no phase is active yet, the first upcoming is what matters
            if current_phase_index is None and current_action is None:
                current_action = (
                    f"Phase {phase['phase']} starts on {phase['date']}. "
                    f"Make sure you're registered and have your Voter ID ready."
                )

    # If all phases are done and result date has passed
    result_date = date.fromisoformat(data.get("result_date", "2099-01-01"))
    if current_phase_index is None and today >= result_date:
        current_action = (
            "All phases are complete and results have been declared. "
            "Visit https://results.eci.gov.in to see the official results."
        )

    data["current_phase_index"] = current_phase_index
    data["current_action"] = current_action
    data["today"] = today.isoformat()

    return data

def get_personal_timeline(age: int, has_voter_id: bool, state: str) -> dict:
    data = get_timeline()
    
    # Personalize deadlines and current action based on state
    if age < 18:
        data["current_action"] = "You are not yet 18. Your focus is pre-registration."
        data["user_deadline"] = "Turn 18 before Jan 1 of the election year"
    elif not has_voter_id:
        data["current_action"] = "Your most urgent step is to register for a Voter ID immediately."
        data["user_deadline"] = "ASAP (Takes 2-3 weeks to process)"
    else:
        if state:
            # Find the phase for this state
            state_phase = next((p for p in data["phases"] if state in p["states"]), None)
            if state_phase:
                if state_phase["status"] == "upcoming":
                    data["current_action"] = f"Your state ({state}) votes in Phase {state_phase['phase']} on {state_phase['date']}."
                    data["user_deadline"] = f"Vote on {state_phase['date']}"
                elif state_phase["status"] == "active":
                    data["current_action"] = f"Voting in your state ({state}) is happening right now!"
                    data["user_deadline"] = "Today"
                else:
                    data["current_action"] = f"Voting in your state ({state}) has concluded."
                    data["user_deadline"] = "None (Completed)"
            else:
                data["current_action"] = "You are registered. Check your polling booth online."
                data["user_deadline"] = "Before your state's voting day"
        else:
            data["current_action"] = "You are registered. Check your polling booth online."
            data["user_deadline"] = "Before your state's voting day"

    return data
