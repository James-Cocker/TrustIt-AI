from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import sys
import uuid

# Add the current directory to path
sys.path.append('.')

# Setup environment variables
from dotenv import load_dotenv
load_dotenv()

# Create FastAPI app
app = FastAPI(title="TrustIt AI API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class AnalysisRequest(BaseModel):
    content: str
    type: str = "text"

class AnalysisResponse(BaseModel):
    analysisId: str
    result: Optional[Dict[str, Any]] = None

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    try:
        # For now, return a simple mock response
        # In production, this would call your actual analysis logic
        analysis_id = str(uuid.uuid4())
        
        return {
            "analysisId": analysis_id,
            "result": {"answer": f"Analysis of: {request.content[:50]}..."}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# This is the entry point for the ASGI server
application = app 