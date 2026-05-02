import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv() # Load keys from .env if present

logger = logging.getLogger("ai_provider")

# ── Provider state ────────────────────────────────────────
_gemini_client: Optional[object] = None
_openai_client: Optional[object] = None
_active_provider: Optional[str] = None  # "gemini" | "openai" | None

# ── 1. Try Google Gemini ──────────────────────────────────
_gemini_types = None
try:
    from google import genai
    from google.genai import types as gemini_types

    _gemini_types = gemini_types
    _gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if _gemini_key:
        _gemini_client = genai.Client(api_key=_gemini_key)
        _active_provider = "gemini"
        logger.info("✅ Gemini AI ready (key: %s...%s)", _gemini_key[:8], _gemini_key[-4:])
    else:
        logger.info("⚠️  No GEMINI_API_KEY found, trying OpenAI...")
except ImportError:
    logger.info("⚠️  google-genai not installed, trying OpenAI...")

# ── 2. Try OpenAI (fallback) ─────────────────────────────
if not _active_provider:
    try:
        from openai import OpenAI

        _openai_key = os.getenv("OPENAI_API_KEY")
        if _openai_key:
            _openai_client = OpenAI(api_key=_openai_key)
            _active_provider = "openai"
            logger.info("✅ OpenAI ready (key: %s...%s)", _openai_key[:8], _openai_key[-4:])
        else:
            logger.warning("⚠️  No OPENAI_API_KEY found — AI features disabled")
    except ImportError:
        logger.warning("⚠️  openai package not installed — AI features disabled")

if not _active_provider:
    logger.warning("🔕 No AI provider available. App works fine — AI just adds clarity.")


# ── System prompt (shared) ────────────────────────────────

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


# ── Unified call ──────────────────────────────────────────

def call_ai(prompt: str, max_tokens: int = 250) -> str | None:
    """
    Call the active AI provider. Returns None if no provider is available.
    Never raises — all errors are caught and logged.
    """
    if _active_provider == "gemini":
        return _call_gemini(prompt)
    elif _active_provider == "openai":
        return _call_openai(prompt, max_tokens)
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


def _call_openai(prompt: str, max_tokens: int) -> str | None:
    """Call OpenAI."""
    try:
        response = _openai_client.chat.completions.create(  # type: ignore
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error("❌ OpenAI call failed: %s", str(e))
        return None


# ── Status ────────────────────────────────────────────────

def get_provider_status() -> dict:
    """Return the current AI provider status for health checks."""
    return {
        "active_provider": _active_provider,
        "gemini_ready": _gemini_client is not None,
        "openai_ready": _openai_client is not None,
    }
