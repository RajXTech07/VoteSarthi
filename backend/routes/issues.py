from fastapi import APIRouter, HTTPException, Depends, Request
from models.schemas import IssueReportRequest
from services.firebase import db
from routes.auth import get_current_uid
from datetime import datetime
from services.limiter import limiter

router = APIRouter(prefix="/api/issues", tags=["issues"])

@router.post("/")
@limiter.limit("5/minute")
async def report_issue(request: Request, issue: IssueReportRequest, uid: str = Depends(get_current_uid)):
    """Allows an authenticated user to report an issue or bug."""
    try:
        issue_data = issue.dict()
        issue_data["reported_by"] = uid
        issue_data["status"] = "Open"
        issue_data["timestamp"] = datetime.utcnow().isoformat()
        
        # Save to Firestore 'issues' collection
        db.collection("issues").add(issue_data)
        
        return {"message": "Issue reported successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit issue: {str(e)}")
