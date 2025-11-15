"""
AI Security Assessor FastAPI Service

This service provides endpoints for assessing software applications' security posture.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import uvicorn

from .models import AssessmentRequest, AssessmentResponse
from .cache_service import CacheService
from .assessor import SecurityAssessor

app = FastAPI(
    title="AI Security Assessor",
    description="CISO-ready trust brief generation service for software applications",
    version="1.0.0"
)

# Add CORS middleware for web UI support
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
cache_service = CacheService()
assessor = SecurityAssessor(cache_service)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": "AI Security Assessor",
        "version": "1.0.0",
        "endpoints": {
            "POST /assess": "Assess a software application",
            "GET /cache/{identifier}": "Retrieve cached assessment",
            "GET /health": "Health check"
        }
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/assess", response_model=AssessmentResponse)
async def assess_application(request: AssessmentRequest):
    """
    Assess a software application's security posture.

    Accepts:
    - product_name: Name of the product
    - company_name: Vendor/company name (optional)
    - url: Product or vendor URL (optional)
    - sha1: Binary hash for verification (optional)

    Returns a comprehensive security assessment with:
    - Entity resolution and vendor identity
    - Software classification/taxonomy
    - Security posture summary with citations
    - CVE trends, incidents, data handling, compliance
    - Trust/risk score (0-100) with rationale
    - Suggested alternatives
    """
    try:
        # Check cache first
        cache_key = assessor.generate_cache_key(request)
        cached_result = cache_service.get(cache_key)

        if cached_result:
            return cached_result

        # Perform new assessment
        assessment = await assessor.assess(request)

        # Cache the result
        cache_service.set(
            cache_key=cache_key,
            assessment_data=assessment.model_dump(),
            product_name=request.product_name,
            company_name=request.company_name,
            sha1=request.sha1,
            url=request.url
        )

        return assessment

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")


@app.post("/assess/file")
async def assess_from_file(file: UploadFile = File(...)):
    """
    Assess an application from an uploaded file (CSV format).

    CSV format: company_name, product_name, sha1
    """
    try:
        content = await file.read()
        # Process file and return assessments
        # TODO: Implement batch processing
        return {"message": "Batch assessment not yet implemented"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")


@app.get("/cache/{identifier}")
async def get_cached_assessment(identifier: str):
    """
    Retrieve a cached assessment by identifier (cache key).
    """
    cached_result = cache_service.get(identifier)

    if not cached_result:
        raise HTTPException(status_code=404, detail="Assessment not found in cache")

    return cached_result


@app.get("/cache")
async def list_cached_assessments(limit: int = 20, offset: int = 0):
    """
    List all cached assessments with pagination.
    """
    cached_items = cache_service.list_all(limit=limit, offset=offset)
    return {
        "total": len(cached_items),
        "limit": limit,
        "offset": offset,
        "assessments": cached_items
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
