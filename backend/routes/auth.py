from fastapi import APIRouter, HTTPException
from models.schemas import AuthRequest, AuthResponse, User, OTPRequest, OTPVerifyRequest, ProfileUpdateRequest
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

CLIENT_ID = os.getenv("NEXT_PUBLIC_GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID")

# In-memory session store (for prototype simplicity)
# In production, use Redis or a database
sessions = {}
otps = {}

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

@router.post("/profile", response_model=AuthResponse)
async def google_profile_auth(profile: dict):
    # This receives the profile directly from the frontend after it fetches it from Google
    user = User(
        email=profile.get("email", ""),
        name=profile.get("name", ""),
        picture=profile.get("picture", ""),
        sub=profile.get("sub", profile.get("id", str(uuid.uuid4())))
    )

    session_token = str(uuid.uuid4())
    sessions[session_token] = user

    return AuthResponse(user=user, session_token=session_token)

@router.get("/me", response_model=User)
async def get_current_user(session_token: str):
    if session_token not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    return sessions[session_token]

@router.post("/otp/send")
async def send_otp(request: OTPRequest):
    otp = "123456" # Fixed OTP for prototyping
    otps[request.mobile_number] = otp
    return {"message": "OTP sent successfully"}

@router.post("/otp/verify", response_model=AuthResponse)
async def verify_otp(request: OTPVerifyRequest):
    if otps.get(request.mobile_number) != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    # In a real app we would check if the user already exists in DB
    # We look up existing session user if we wanted, but here we just create new
    # Actually, iterate through sessions and find if user exists? No DB here.
    user = User(
        mobile_number=request.mobile_number,
        name="",
        sub=f"mob_{request.mobile_number}"
    )
    session_token = str(uuid.uuid4())
    sessions[session_token] = user
    return AuthResponse(user=user, session_token=session_token)

@router.put("/profile", response_model=User)
async def update_profile(session_token: str, profile_update: ProfileUpdateRequest):
    if session_token not in sessions:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    user = sessions[session_token]
    if profile_update.name is not None:
        user.name = profile_update.name
    if profile_update.gender is not None:
        user.gender = profile_update.gender
    if profile_update.dob is not None:
        user.dob = profile_update.dob
    if profile_update.email is not None:
        user.email = profile_update.email
    
    sessions[session_token] = user
    return user
