"""
Document Validator API — Tells users if their documents are valid for voting/registration.

Returns:
- ✅ accepted → You can use this at the polling booth
- ❌ not_accepted → This document is NOT valid for voting
- ⚠️ conditional → Valid only for registration, not at the booth
"""

import json
from pathlib import Path
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/documents", tags=["Document Validator"])

DATA_FILE = Path(__file__).parent.parent / "data" / "documents.json"


def _load_documents() -> list[dict]:
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["documents"]


@router.get("/")
def get_all_documents():
    """Return all documents with their validation status."""
    docs = _load_documents()
    # Group by status for easy frontend rendering
    accepted = [d for d in docs if d["status"] == "accepted"]
    not_accepted = [d for d in docs if d["status"] == "not_accepted"]
    conditional = [d for d in docs if d["status"] == "conditional"]

    return {
        "total": len(docs),
        "accepted_count": len(accepted),
        "not_accepted_count": len(not_accepted),
        "conditional_count": len(conditional),
        "documents": docs,
    }


@router.get("/check/{doc_id}")
def check_document(doc_id: str, purpose: Optional[str] = Query(None, description="voting or registration")):
    """
    Check if a specific document is valid.
    Returns status, conditions, and tips.
    """
    docs = _load_documents()
    doc = next((d for d in docs if d["id"] == doc_id), None)

    if not doc:
        return {
            "found": False,
            "message": f"Document '{doc_id}' not recognized. Check the full list at /api/documents/.",
        }

    # Build a clear verdict
    if doc["status"] == "accepted":
        if purpose == "registration":
            valid_for_purpose = "registration" in doc["use_for"]
            verdict = "✅ Yes — accepted for voter registration" if valid_for_purpose else "⚠️ Accepted for voting, but check if it works as registration proof"
        elif purpose == "voting":
            valid_for_purpose = "voting" in doc["use_for"]
            verdict = "✅ Yes — accepted at the polling booth" if valid_for_purpose else "⚠️ Accepted for registration only"
        else:
            verdict = "✅ Accepted — this is one of the 12 approved documents"
    elif doc["status"] == "not_accepted":
        verdict = "❌ NOT accepted at the polling booth"
    else:
        verdict = "⚠️ Conditionally accepted — read the conditions below"

    return {
        "found": True,
        "document": doc,
        "verdict": verdict,
        "purpose_checked": purpose,
    }
