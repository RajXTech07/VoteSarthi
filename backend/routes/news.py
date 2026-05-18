"""
News Feed — Fetches Indian political/election news from GNews API.
Uses an in-memory cache (refreshed every 6 hours) to conserve API quota.
GNews free tier = 100 requests/day, so caching is critical.
"""

import os
import time
import httpx
from fastapi import APIRouter, Request
from services.limiter import limiter

router = APIRouter(prefix="/api/news", tags=["news"])

# ── In-Memory Cache ──────────────────────────────────────
_news_cache = {
    "articles": [],
    "last_fetched": 0,       # UNIX timestamp of last successful fetch
}
CACHE_TTL = 6 * 60 * 60     # 6 hours in seconds

GNEWS_API_URL = "https://gnews.io/api/v4/search"
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY", "")


async def _fetch_news_from_gnews():
    """
    Calls the GNews API to fetch the latest Indian election / political news.
    Returns a cleaned list of article dicts.
    """
    params = {
        "q": "India election OR Indian politics OR voting India",
        "lang": "en",
        "country": "in",
        "max": 10,
        "apikey": GNEWS_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(GNEWS_API_URL, params=params)
            response.raise_for_status()
            data = response.json()

        articles = []
        for item in data.get("articles", []):
            articles.append({
                "title": item.get("title", ""),
                "description": item.get("description", ""),
                "url": item.get("url", ""),
                "image": item.get("image", ""),
                "source": item.get("source", {}).get("name", "Unknown"),
                "publishedAt": item.get("publishedAt", ""),
            })
        return articles

    except Exception as e:
        print(f"[News] GNews fetch failed: {e}")
        return []


@router.get("/")
@limiter.limit("30/minute")
async def get_news(request: Request):
    """
    Returns cached news articles. Refreshes from GNews if cache is stale (>6h).
    """
    global _news_cache
    now = time.time()

    # Check if cache is stale
    if now - _news_cache["last_fetched"] > CACHE_TTL or not _news_cache["articles"]:
        fresh_articles = await _fetch_news_from_gnews()
        if fresh_articles:
            _news_cache["articles"] = fresh_articles
            _news_cache["last_fetched"] = now

    return {
        "articles": _news_cache["articles"],
        "cached": now - _news_cache["last_fetched"] < CACHE_TTL,
    }
