"""
Smart Context Engine — Unified user state and recommendations.

Computes a full user profile from inputs and derives:
- Urgency level (election proximity)
- Personalized recommendations
- Quick links (Google Maps, NVSP, ECI)
- Dynamic tips based on date + state + status

This is the "brain" — it makes the app feel like a smart assistant.
"""

import json
import os
from datetime import date, datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"


def _load_timeline() -> dict:
    with open(DATA_DIR / "election_timeline.json", "r", encoding="utf-8") as f:
        return json.load(f)


def _compute_urgency(timeline: dict) -> dict:
    """
    Compute urgency based on how close we are to an active/upcoming election.
    Returns urgency level, days until next event, and a human-readable label.
    """
    today = date.today()
    result_date = datetime.strptime(timeline["result_date"], "%Y-%m-%d").date()

    # Check if any phase is upcoming or active
    for phase in timeline["phases"]:
        phase_date = datetime.strptime(phase["date"], "%Y-%m-%d").date()
        end_date = datetime.strptime(phase["end_date"], "%Y-%m-%d").date()

        if today < phase_date:
            days_until = (phase_date - today).days
            if days_until <= 7:
                return {
                    "level": "critical",
                    "label": f"Phase {phase['phase']} in {days_until} days!",
                    "days_until": days_until,
                    "color": "red",
                }
            elif days_until <= 30:
                return {
                    "level": "high",
                    "label": f"Phase {phase['phase']} in {days_until} days",
                    "days_until": days_until,
                    "color": "orange",
                }
            else:
                return {
                    "level": "moderate",
                    "label": f"Next phase in {days_until} days",
                    "days_until": days_until,
                    "color": "yellow",
                }

        if phase_date <= today <= end_date:
            return {
                "level": "critical",
                "label": f"Phase {phase['phase']} is HAPPENING NOW",
                "days_until": 0,
                "color": "red",
            }

    # All phases completed
    if today <= result_date:
        days_until = (result_date - today).days
        return {
            "level": "moderate",
            "label": f"Results in {days_until} days",
            "days_until": days_until,
            "color": "yellow",
        }

    return {
        "level": "low",
        "label": "Election completed — results declared",
        "days_until": 0,
        "color": "green",
    }


def _get_state_info(state: str, timeline: dict) -> dict | None:
    """Find which phase a state votes in."""
    if not state:
        return None

    state_lower = state.lower()
    for phase in timeline["phases"]:
        for s in phase["states"]:
            if s.lower() == state_lower:
                return {
                    "phase": phase["phase"],
                    "date": phase["date"],
                    "seats": phase["seats"],
                    "states_in_phase": len(phase["states"]),
                }
    return None


def _build_recommendations(
    age: int | None,
    is_citizen: bool | None,
    has_voter_id: bool | None,
    state: str | None,
    urgency: dict,
) -> list[dict]:
    """Build prioritized, actionable recommendations."""
    recs = []

    # Not citizen
    if is_citizen is False:
        recs.append({
            "priority": 1,
            "action": "Verify your citizenship status",
            "detail": "Only Indian citizens can vote. Contact your nearest District Magistrate office.",
            "icon": "🚫",
            "url": None,
        })
        return recs  # No further recs needed

    # Underage
    if age is not None and age < 18:
        months_until = (18 - age) * 12
        recs.append({
            "priority": 1,
            "action": f"You'll be eligible in ~{months_until} months",
            "detail": "Pre-register 3 months before turning 18 on the NVSP portal.",
            "icon": "⏳",
            "url": "https://voters.eci.gov.in",
        })
        recs.append({
            "priority": 2,
            "action": "Gather your documents now",
            "detail": "Keep your Aadhaar, school ID, and address proof ready.",
            "icon": "📄",
            "url": None,
        })
        return recs

    # No voter ID — highest priority
    if has_voter_id is False:
        recs.append({
            "priority": 1,
            "action": "Apply for Voter ID on NVSP",
            "detail": "Fill Form 6 online. You'll need Aadhaar, photo, and address proof.",
            "icon": "📝",
            "url": "https://voters.eci.gov.in",
        })
        if urgency["level"] in ("critical", "high"):
            recs.append({
                "priority": 2,
                "action": "Visit your nearest ERO office TODAY",
                "detail": f"Election is close ({urgency['label']}). Offline registration is faster.",
                "icon": "🏃",
                "url": None,
            })

    # Has voter ID
    if has_voter_id is True:
        recs.append({
            "priority": 1,
            "action": "Check your name in the electoral roll",
            "detail": "Search by name or EPIC number on the ECI portal.",
            "icon": "🔍",
            "url": "https://electoralsearch.eci.gov.in",
        })
        recs.append({
            "priority": 2,
            "action": "Find your polling booth",
            "detail": "Download the Voter Helpline App or check your voter slip.",
            "icon": "📍",
            "url": "https://play.google.com/store/apps/details?id=com.eci.citizen",
        })

    # State-specific tip
    if state:
        timeline = _load_timeline()
        state_info = _get_state_info(state, timeline)
        if state_info:
            recs.append({
                "priority": 3,
                "action": f"Your state votes in Phase {state_info['phase']}",
                "detail": f"Date: {state_info['date']} · {state_info['seats']} seats",
                "icon": "🗓️",
                "url": None,
            })

    # Universal rec
    recs.append({
        "priority": 10,
        "action": "Download the Voter Helpline App",
        "detail": "Find your booth, check your status, and get election updates — all in one app.",
        "icon": "📱",
        "url": "https://play.google.com/store/apps/details?id=com.eci.citizen",
    })

    return sorted(recs, key=lambda r: r["priority"])


def _build_quick_links(state: str | None, has_voter_id: bool | None) -> list[dict]:
    """Google services + official links relevant to the user."""
    links = [
        {
            "label": "NVSP Portal",
            "url": "https://voters.eci.gov.in",
            "icon": "🌐",
            "desc": "Register, track, or download Voter ID",
        },
        {
            "label": "Electoral Search",
            "url": "https://electoralsearch.eci.gov.in",
            "icon": "🔍",
            "desc": "Check if your name is in the voter list",
        },
        {
            "label": "Election Commission",
            "url": "https://eci.gov.in",
            "icon": "🏛️",
            "desc": "Official election results and updates",
        },
        {
            "label": "Voter Helpline App",
            "url": "https://play.google.com/store/apps/details?id=com.eci.citizen",
            "icon": "📱",
            "desc": "Booth finder, voter slip, and more",
        },
    ]

    # Google Maps — polling booth search
    search_query = "polling booth near me"
    if state:
        search_query = f"polling booth {state} India"
    links.append({
        "label": "Find Polling Booth (Maps)",
        "url": f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}",
        "icon": "📍",
        "desc": "Google Maps: nearest polling station",
    })

    return links


def compute_smart_context(
    age: int | None = None,
    is_citizen: bool | None = None,
    has_voter_id: bool | None = None,
    state: str | None = None,
) -> dict:
    """
    Compute the full smart context for a user.

    This is the central intelligence of the app — it takes raw user inputs
    and produces a complete, actionable profile.
    """
    timeline = _load_timeline()
    urgency = _compute_urgency(timeline)
    state_info = _get_state_info(state, timeline) if state else None
    recommendations = _build_recommendations(age, is_citizen, has_voter_id, state, urgency)
    quick_links = _build_quick_links(state, has_voter_id)

    # Compute user status label
    if is_citizen is False:
        status = "not_citizen"
        status_label = "Not eligible — citizenship required"
    elif age is not None and age < 18:
        status = "underage"
        status_label = f"Not yet eligible — {18 - age} years to go"
    elif has_voter_id is False:
        status = "needs_registration"
        status_label = "Eligible but not registered — apply now"
    elif has_voter_id is True:
        status = "registered"
        status_label = "Registered voter — ready to vote"
    else:
        status = "unknown"
        status_label = "Tell us about yourself to get personalized guidance"

    # Google Maps embed URL for polling booth
    # Key is loaded from GOOGLE_MAPS_API_KEY env var — never hardcoded.
    maps_query = f"polling booth {state or ''} India".strip()
    _maps_key = os.getenv("GOOGLE_MAPS_API_KEY")
    maps_embed_url = (
        f"https://www.google.com/maps/embed/v1/search?q={maps_query.replace(' ', '+')}&key={_maps_key}"
        if _maps_key
        else None
    )

    return {
        "user_status": status,
        "user_status_label": status_label,
        "urgency": urgency,
        "state_info": state_info,
        "recommendations": recommendations,
        "quick_links": quick_links,
        "maps_embed_url": maps_embed_url,
        "maps_search_url": f"https://www.google.com/maps/search/{maps_query.replace(' ', '+')}",
        "election_name": timeline["election_name"],
        "election_completed": urgency["level"] == "low",
        "today": date.today().isoformat(),
    }
