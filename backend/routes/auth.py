from fastapi import APIRouter, HTTPException
from models.schemas import AuthRequest, AuthResponse, User
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

CLIENT_ID = os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID")

# In-memory session store (for prototype simplicity)
# In production, use Redis or a database
sessions = {}

@router.post("/google", response_model=AuthResponse)
async def google_auth(request: AuthRequest):
    try:
        # If no client ID is set, bypass verification for local testing if needed
        # But we expect the client to pass a valid token and we'll verify it
        if not CLIENT_ID:
            print("WARNING: No GOOGLE_CLIENT_ID set. Make sure to set it in .env")
            
        idinfo = id_token.verify_oauth2_token(
            request.token, requests.Request(), CLIENT_ID
        )

        user = User(
            email=idinfo.get("email", ""),
            name=idinfo.get("name", ""),
            picture=idinfo.get("picture", ""),
            sub=idinfo.get("sub", "")
        )

        session_token = str(uuid.uuid4())
        sessions[session_token] = user

        return AuthResponse(user=user, session_token=session_token)

    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

@router.get("/me", response_model=User)
async def get_current_user(session_token: str):
    if session_token not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    return sessions[session_token]
