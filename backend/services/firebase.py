import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

import json

# Initialize the app only once
if not firebase_admin._apps:
    # 1. Try to load from Environment Variable (For Production/Render)
    firebase_cred_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
    
    if firebase_cred_json:
        try:
            cred_dict = json.loads(firebase_cred_json, strict=False)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
    else:
        # 2. Fallback to Local File (For Local Development)
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cred_path = os.path.join(current_dir, "firebase-credentials.json")
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Failed to load local firebase credentials file: {e}")

# Get a reference to the Firestore database
try:
    db = firestore.client()
except Exception as e:
    db = None
    print(f"Failed to initialize Firestore: {e}")

def verify_firebase_token(id_token: str):
    """Verifies a Firebase ID token and returns the decoded token."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
