import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()  # Load keys from .env if present

logger = logging.getLogger("ai_provider")

# ── Provider state ────────────────────────────────────────
_gemini_client: Optional[object] = None
_gemini_types = None
_active_provider: Optional[str] = None  # "gemini" | None

# ── Initialize Google Gemini ──────────────────────────────
try:
    from google import genai
    from google.genai import types as gemini_types

    _gemini_types = gemini_types
    _gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if _gemini_key:
        _gemini_client = genai.Client(api_key=_gemini_key)
        _active_provider = "gemini"
        logger.info("✅ Gemini AI ready")
    else:
        logger.warning("⚠️  No GEMINI_API_KEY found — AI features disabled")
except ImportError:
    logger.warning("⚠️  google-genai not installed — AI features disabled")

if not _active_provider:
    logger.warning("🔕 No AI provider available. App works fine — AI just adds clarity.")


# ── System prompt ─────────────────────────────────────────

SYSTEM_PROMPT = (
    "You are an assistant helping Indian voters understand elections.\n\n"
    "Rules:\n"
    "- Use ONLY the data provided — never guess\n"
    "- Maximum 80–120 words\n"
    "- Use bullet points, not paragraphs\n"
    "- Bold the single most important action\n"
    "- Tone: simple, direct, helpful\n"
    "- If data is missing: say 'Check eci.gov.in for details.'"
)


# ── AI call ───────────────────────────────────────────────

def call_ai(prompt: str, max_tokens: int = 250) -> str | None:
    """
    Call Google Gemini. Returns None if the provider is unavailable.
    Never raises — all errors are caught and logged.
    """
    if _active_provider == "gemini":
        return _call_gemini(prompt)
    return None


def _call_gemini(prompt: str) -> str | None:
    """Call Google Gemini."""
    try:
        if _gemini_client is None or _gemini_types is None:
            return None
        full_prompt = f"{SYSTEM_PROMPT}\n\n---\n\n{prompt}"
        response = _gemini_client.models.generate_content(  # type: ignore
            model="gemini-2.0-flash",
            contents=full_prompt,
            config=_gemini_types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=250,
            ),
        )
        return response.text.strip() if response and response.text else None
    except Exception as e:
        logger.error("❌ Gemini call failed: %s", str(e))
        return None


# ── Status ────────────────────────────────────────────────

def get_provider_status() -> dict:
    """Return the current AI provider status for health checks."""
    return {
        "active_provider": _active_provider,
        "gemini_ready": _gemini_client is not None,
    }
