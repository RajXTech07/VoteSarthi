"""
Steps Service — Personalized voting guide.

Enforces personalization: no two user profiles see the same flow.

Filtering rules (all deterministic, no AI):
  - age < 18        → underage step only
  - no voter ID     → registration (3) + election day (5) = 8 steps
  - has voter ID    → preparation (2) + election day (5) = 7 steps
  - no context      → all steps (backward compatible)

Output includes:
  - Renumbered steps starting from 1
  - current_step_index: which step to focus on first
  - flow_id: unique identifier for the flow ("underage" | "no_id" | "has_id" | "all")
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_steps_data() -> dict:
    """Load the full steps data file."""
    with open(DATA_DIR / "voting_steps.json", "r", encoding="utf-8") as f:
        return json.load(f)


def _renumber(steps: list[dict]) -> list[dict]:
    """Renumber steps sequentially starting from 1. Returns new list (no mutation)."""
    return [
        {**step, "step_number": i + 1, "total_steps": len(steps)}
        for i, step in enumerate(steps)
    ]


def get_voting_steps(age: int | None = None, has_voter_id: bool | None = None) -> dict:
    """
    Return personalized steps based on user context.

    Guarantees:
    - User A (no voter ID) and User B (has voter ID) get completely different flows
    - Steps are renumbered 1..N for the specific user
    - current_step_index always points to the first actionable step
    """
    data = _load_steps_data()
    all_steps = data["steps"]

    # ── No context → return everything (backward compatible) ──
    if age is None and has_voter_id is None:
        numbered = _renumber(all_steps)
        return {
            "steps": numbered,
            "context_summary": "Showing all steps (no user context provided)",
            "personalized": False,
            "flow_id": "all",
            "current_step_index": 0,
            "total_steps": len(numbered),
        }

    # ── Underage → special single step ────────────────────────
    if age is not None and age < 18:
        underage = data.get("underage_step")
        steps = _renumber([underage]) if underage else []
        return {
            "steps": steps,
            "context_summary": f"You're {age} — not yet eligible, but you can prepare now.",
            "personalized": True,
            "flow_id": "underage",
            "current_step_index": 0,
            "total_steps": len(steps),
        }

    # ── No Voter ID → registration + election day ─────────────
    if has_voter_id is False:
        filtered = [
            s for s in all_steps
            if s.get("for_no_voter_id")
        ]
        numbered = _renumber(filtered)
        return {
            "steps": numbered,
            "context_summary": "You need a Voter ID first. Here's your full path: register → prepare → vote.",
            "personalized": True,
            "flow_id": "no_id",
            "current_step_index": 0,  # First step: Register on NVSP
            "total_steps": len(numbered),
        }

    # ── Has Voter ID → preparation + election day only ────────
    if has_voter_id is True:
        filtered = [
            s for s in all_steps
            if s.get("requires_voter_id")
        ]
        numbered = _renumber(filtered)
        return {
            "steps": numbered,
            "context_summary": "You have a Voter ID. Skip registration — here's your path: prepare → vote.",
            "personalized": True,
            "flow_id": "has_id",
            "current_step_index": 0,  # First step: Check Electoral Roll
            "total_steps": len(numbered),
        }

    # ── Fallback ─────────────────────────────────────────────
    numbered = _renumber(all_steps)
    return {
        "steps": numbered,
        "context_summary": "Showing all steps",
        "personalized": False,
        "flow_id": "all",
        "current_step_index": 0,
        "total_steps": len(numbered),
    }
