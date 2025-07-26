from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import uvicorn
from dotenv import load_dotenv
from .modules.gitingest import generate_gitingest_txt
from .modules.repository_search import RepositorySearch

# Load environment variables
load_dotenv()

# Pydantic models
class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

class GitingestRequest(BaseModel):
    repository_url: str
    token: Optional[str] = None
    include_submodules: Optional[bool] = False
    include_gitignored: Optional[bool] = False
    filename: Optional[str] = None

class VectorizeRequest(BaseModel):
    repository_url: str
    token: Optional[str] = None
    include_submodules: Optional[bool] = False
    include_gitignored: Optional[bool] = False

class QueryRequest(BaseModel):
    query: str
    repository_url: str
    token: Optional[str] = None
    include_submodules: Optional[bool] = False
    include_gitignored: Optional[bool] = False
    include_full_content: Optional[bool] = False

class RepositorySearchRequest(BaseModel):
    repository_name: str
    max_results: Optional[int] = 50

class CriteriaSearchRequest(BaseModel):
    topics: List[str]
    languages: List[str]
    name_keyword: Optional[str] = ""
    max_results: Optional[int] = 100

class DescriptionSearchRequest(BaseModel):
    description: str
    max_results: Optional[int] = 100

class PromptSearchRequest(BaseModel):
    prompt: str
    max_results: Optional[int] = 500
    limit_results: Optional[int] = 10

# Initialize FastAPI app
app = FastAPI(
    title="Git Galaxy API",
    description="A FastAPI application for Git Galaxy",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repository_search = RepositorySearch()

@app.on_event("startup")
async def startup_event():
    """Log environment variables on startup"""
    port = os.getenv("PORT", "8000")
    print(f"🚀 Server starting on port: {port}")

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Git Galaxy API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "Git repository text generation with gitingest",
            "Repository search and similarity analysis",
            "AI-powered repository discovery from prompts",
            "Health check endpoint",
            "Frontend integration"
        ]
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Git Galaxy API is running",
        version="1.0.0"
    )

@app.post("/repositories/search-by-prompt", response_model=Dict[str, Any])
async def search_repositories_by_prompt(request: PromptSearchRequest):
    """Search repositories based on a user prompt using AI extraction"""
    try:
        result = repository_search.search_by_prompt(
            user_prompt=request.prompt,
            max_results=request.max_results,
            limit_results=request.limit_results
        )

        print(request.prompt)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return {
            "status": "success",
            "message": f"Found {len(result['repositories'])} repositories based on prompt",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search repositories by prompt: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    ) 