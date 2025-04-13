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

# Add CORS middleware with more specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://trust-ai-6b2c2.web.app", "http://localhost:3000"],
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
        # Log the incoming request
        print(f"Received analysis request for content: {request.content[:50]}...")
        
        # For now, return a simple mock response
        # In production, this would call your actual analysis logic
        analysis_id = str(uuid.uuid4())
        
        result = {
            "analysisId": analysis_id,
            "result": {
                "answer": f"Analysis of: {request.content[:50]}...",
                "confidence": 0.85,
                "details": {
                    "source_credibility": "medium",
                    "factual_accuracy": "high",
                    "sentiment": "neutral"
                }
            }
        }
        
        print(f"Returning result with ID: {analysis_id}")
        return result
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Simple root endpoint for testing
@app.get("/")
async def root():
    return {"message": "TrustIt AI API is running"}

# This is the entry point for the ASGI server
application = app 