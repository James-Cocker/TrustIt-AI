"""
WSGI configuration file for PythonAnywhere deployment
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.services import PortiaSearchService
from backend.config import load_config
from backend.utils import setup_environment

# Setup environment for accessing API keys
setup_environment()

# Create FastAPI app
app = FastAPI(title="TrustIt AI API")

# Add CORS middleware to allow requests from Firebase frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to your Firebase domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data model for analysis request
class AnalysisRequest(BaseModel):
    content: str
    type: str = "text"

# Data model for analysis response
class AnalysisResponse(BaseModel):
    analysisId: str
    result: Optional[Dict[str, Any]] = None

# Initialize search service
config = load_config()
search_service = PortiaSearchService(config)

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    try:
        # Process the content using Portia search service
        result = search_service.search(request.content)
        
        # In a real app, you would store this in a database
        # For now, we'll generate a simple ID
        import uuid
        analysis_id = str(uuid.uuid4())
        
        # Store the result in a way that can be retrieved later
        # This is simplified - you would use a database in production
        # For demo purposes, we'll return the ID that can be used in the results page
        
        return {
            "analysisId": analysis_id,
            "result": {"answer": result}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# This is the entry point for the PythonAnywhere WSGI server
application = app