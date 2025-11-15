"""
Quick test script to verify the API is working
"""

import asyncio
from src.models import AssessmentRequest
from src.assessor import SecurityAssessor
from src.cache_service import CacheService


async def test_assessment():
    """Test the assessment functionality."""
    print("Testing AI Security Assessor...")

    # Initialize services
    cache_service = CacheService(db_path="test_cache.db")
    assessor = SecurityAssessor(cache_service)

    # Create test request
    request = AssessmentRequest(
        product_name="FileZilla",
        company_name="Tim Kosse",
        sha1="e94803128b6368b5c2c876a782b1e88346356844"
    )

    print(f"\n📋 Assessing: {request.product_name}")
    print(f"   Vendor: {request.company_name}")
    print(f"   SHA1: {request.sha1}")

    # Perform assessment
    result = await assessor.assess(request)

    print(f"\n✓ Assessment completed!")
    print(f"  Category: {result.category}")
    print(f"  Trust Score: {result.trust_score.score}/100")
    print(f"  Confidence: {result.trust_score.confidence}")
    print(f"  Cache Key: {result.cache_key}")

    # Test cache - save first
    cache_key = assessor.generate_cache_key(request)
    print(f"\n📦 Testing cache...")
    cache_service.set(
        cache_key=cache_key,
        assessment_data=result.model_dump(),
        product_name=request.product_name,
        company_name=request.company_name,
        sha1=request.sha1
    )
    cached = cache_service.get(cache_key)
    if cached:
        print(f"  ✓ Cache working! Retrieved cached assessment")
    else:
        print(f"  ✗ Cache test failed")

    # Clean up test database
    import os
    if os.path.exists("test_cache.db"):
        os.remove("test_cache.db")
        print(f"\n🧹 Cleaned up test database")

    print("\n✓ All tests passed!")


if __name__ == "__main__":
    asyncio.run(test_assessment())
