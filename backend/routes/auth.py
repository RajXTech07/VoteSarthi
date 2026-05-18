from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.schemas import FirebaseTokenRequest, User, ProfileUpdateRequest
from services.firebase import verify_firebase_token, db
from services.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

def get_current_uid(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Extracts and verifies the Firebase ID token from the Authorization header."""
    token = credentials.credentials
    decoded_token = verify_firebase_token(token)
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid Firebase Token")
    return decoded_token.get("uid")

@router.post("/verify")
@limiter.limit("5/minute")
async def verify_login(request: Request, body: FirebaseTokenRequest):
    """Called after frontend successfully logs in via Firebase to sync the user."""
    decoded_token = verify_firebase_token(body.token)
    if not decoded_token:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    uid = decoded_token.get("uid")
    mobile = decoded_token.get("phone_number")
    email = decoded_token.get("email")
    name = decoded_token.get("name")
    picture = decoded_token.get("picture")

    # Check if user exists in Firestore
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()

    if not doc.exists:
        # Create new user profile in Firestore
        user_data = {
            "uid": uid,
            "mobile_number": mobile,
            "email": email,
            "name": name,
            "picture": picture,
            "gender": None,
            "dob": None,
            "state": None,
            "district": None,
        }
        user_ref.set(user_data)
        return {"user": user_data}
    
    existing = doc.to_dict()
    existing["uid"] = uid
    return {"user": existing}

@router.put("/profile")
@limiter.limit("10/minute")
async def update_profile(request: Request, profile_update: ProfileUpdateRequest, uid: str = Depends(get_current_uid)):
    """Updates the user profile securely based on their verified token."""
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Only update fields that were provided and are not empty strings
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None and v != ""}
    
    if update_data:
        user_ref.update(update_data)
        
    updated_doc = user_ref.get()
    result = updated_doc.to_dict()
    # Always ensure uid is present in the response
    result["uid"] = uid
    return result

@router.get("/me", response_model=User)
@limiter.limit("30/minute")
async def get_current_user(request: Request, uid: str = Depends(get_current_uid)):
    """Gets the current user's profile."""
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()
