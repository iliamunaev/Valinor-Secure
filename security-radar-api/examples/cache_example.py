#!/usr/bin/env python3
"""
Cache Retrieval Example for AI Security Assessor

This script demonstrates how to:
1. Perform an assessment
2. Extract the cache_key from the response
3. Retrieve the assessment from cache using the cache_key
4. List all cached assessments
"""

import requests
import sys
import json
from typing import Dict, Any


API_URL = "http://localhost:8088"


def check_service() -> bool:
    """Check if the API service is running."""
    try:
        response = requests.get(f"{API_URL}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def perform_assessment(product_name: str, company_name: str = None) -> Dict[str, Any]:
    """Perform a security assessment."""
    payload = {"product_name": product_name}
    if company_name:
        payload["company_name"] = company_name

    response = requests.post(f"{API_URL}/assess", json=payload)
    response.raise_for_status()
    return response.json()


def get_from_cache(cache_key: str) -> Dict[str, Any]:
    """Retrieve an assessment from cache using cache_key."""
    response = requests.get(f"{API_URL}/cache/{cache_key}")
    response.raise_for_status()
    return response.json()


def list_cached_assessments(limit: int = 5) -> Dict[str, Any]:
    """List all cached assessments."""
    response = requests.get(f"{API_URL}/cache", params={"limit": limit})
    response.raise_for_status()
    return response.json()


def print_assessment_summary(data: Dict[str, Any]):
    """Print a summary of the assessment."""
    print(f"   Product: {data['product_name']}")
    print(f"   Vendor: {data['vendor']['name']}")
    print(f"   Category: {data['category']}")
    print(f"   Trust Score: {data['trust_score']['score']}/100")
    print(f"   Confidence: {data['trust_score']['confidence']}")

    if '_cache_metadata' in data:
        print(f"   Cached At: {data['_cache_metadata']['cached_at']}")
        print(f"   Access Count: {data['_cache_metadata']['access_count']}")


def main():
    print("🔍 AI Security Assessor - Cache Example")
    print("=" * 50)
    print()

    # Step 0: Check if service is running
    print("1️⃣ Checking if service is running...")
    if not check_service():
        print("❌ Error: Service is not running at", API_URL)
        print("   Please start the service first:")
        print("   - python main.py")
        print("   - docker-compose up")
        print("   - make up")
        sys.exit(1)
    print("✅ Service is running")
    print()

    # Step 1: Perform an assessment
    print("2️⃣ Step 1: Performing assessment for FileZilla...")
    try:
        assessment = perform_assessment(
            product_name="FileZilla",
            company_name="Tim Kosse"
        )
        cache_key = assessment['cache_key']
        print("✅ Assessment complete!")
        print(f"   Cache Key: {cache_key[:32]}...")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    # Step 2: Retrieve from cache
    print("3️⃣ Step 2: Retrieving assessment from cache...")
    try:
        cached_assessment = get_from_cache(cache_key)
        print("✅ Successfully retrieved from cache!")
        print()
        print("📊 Cached Assessment Details:")
        print_assessment_summary(cached_assessment)
        print()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            print("❌ Error: Assessment not found in cache")
        else:
            print(f"❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    # Step 3: List all cached assessments
    print("4️⃣ Step 3: Listing all cached assessments...")
    try:
        cache_list = list_cached_assessments(limit=5)
        print(f"✅ Found {cache_list['total']} cached assessments:")
        print()

        for item in cache_list['assessments']:
            print(f"   • {item['product_name']} ({item.get('company_name', 'N/A')})")
            print(f"     Cache Key: {item['cache_key'][:32]}...")
            print(f"     Cached: {item['cached_at']}")
            print(f"     Access Count: {item['access_count']}")
            print()
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    print("✅ Cache example completed successfully!")
    print()
    print("💡 Tip: You can use the cache_key from any assessment to retrieve it later:")
    print(f"   cached = get_from_cache('YOUR_CACHE_KEY')")


if __name__ == "__main__":
    main()
