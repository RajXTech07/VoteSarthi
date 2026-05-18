import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

# Get absolute path to the credentials file
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cred_path = os.path.join(current_dir, "firebase-credentials.json")

# Initialize the app only once
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)

# Get a reference to the Firestore database
db = firestore.client()

def verify_firebase_token(id_token: str):
    """Verifies a Firebase ID token and returns the decoded token."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None
