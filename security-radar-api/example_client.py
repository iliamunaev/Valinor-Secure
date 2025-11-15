"""
Example client for the AI Security Assessor API

This script demonstrates how to interact with the assessment service.
"""

import requests
import json
from typing import Optional


class AssessorClient:
    """Client for interacting with the AI Security Assessor API."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize client with API base URL."""
        self.base_url = base_url

    def health_check(self) -> dict:
        """Check if the API is healthy."""
        response = requests.get(f"{self.base_url}/health")
        return response.json()

    def assess(
        self,
        product_name: str,
        company_name: Optional[str] = None,
        url: Optional[str] = None,
        sha1: Optional[str] = None,
        force_refresh: bool = False
    ) -> dict:
        """
        Request an assessment for a software product.

        Args:
            product_name: Name of the product
            company_name: Vendor/company name (optional)
            url: Product or vendor URL (optional)
            sha1: SHA-1 hash of binary (optional)
            force_refresh: Force refresh from cache (optional)

        Returns:
            Assessment results as dictionary
        """
        payload = {
            "product_name": product_name,
            "force_refresh": force_refresh
        }

        if company_name:
            payload["company_name"] = company_name
        if url:
            payload["url"] = url
        if sha1:
            payload["sha1"] = sha1

        response = requests.post(
            f"{self.base_url}/assess",
            json=payload
        )
        response.raise_for_status()
        return response.json()

    def get_cached(self, cache_key: str) -> dict:
        """Retrieve a cached assessment by cache key."""
        response = requests.get(f"{self.base_url}/cache/{cache_key}")
        response.raise_for_status()
        return response.json()

    def list_cached(self, limit: int = 20, offset: int = 0) -> dict:
        """List all cached assessments."""
        response = requests.get(
            f"{self.base_url}/cache",
            params={"limit": limit, "offset": offset}
        )
        response.raise_for_status()
        return response.json()


def print_assessment(assessment: dict):
    """Pretty print an assessment."""
    print("\n" + "="*80)
    print(f"SECURITY ASSESSMENT: {assessment['product_name']}")
    print("="*80)

    print(f"\n📦 PRODUCT INFORMATION")
    print(f"  Name: {assessment['product_name']}")
    print(f"  Vendor: {assessment['vendor']['name']}")
    print(f"  Category: {assessment['category']}")
    if assessment['vendor'].get('website'):
        print(f"  Website: {assessment['vendor']['website']}")

    print(f"\n📊 TRUST SCORE")
    score = assessment['trust_score']
    print(f"  Score: {score['score']}/100")
    print(f"  Confidence: {score['confidence']}")
    print(f"  Rationale: {score['rationale']}")

    if score.get('risk_factors'):
        print(f"\n  ⚠️  Risk Factors:")
        for factor in score['risk_factors']:
            print(f"     • {factor}")

    if score.get('positive_factors'):
        print(f"\n  ✓ Positive Factors:")
        for factor in score['positive_factors']:
            print(f"     • {factor}")

    print(f"\n🔒 SECURITY POSTURE")
    cve = assessment['cve_trends']
    print(f"  CVE Summary: {cve['trend_summary']}")
    if cve['total_cves'] > 0:
        print(f"  Total CVEs: {cve['total_cves']}")
        print(f"    Critical: {cve['critical_count']}")
        print(f"    High: {cve['high_count']}")
        print(f"    Medium: {cve['medium_count']}")
        print(f"    Low: {cve['low_count']}")

    compliance = assessment['compliance']
    print(f"\n  Compliance: {compliance['notes']}")

    if assessment.get('alternatives') and len(assessment['alternatives']) > 0:
        print(f"\n💡 ALTERNATIVES")
        for alt in assessment['alternatives']:
            print(f"  • {alt['product_name']} by {alt['vendor']}")
            print(f"    {alt['rationale']}")

    print(f"\n⏰ Assessment Time: {assessment['assessment_timestamp']}")
    if assessment.get('cache_key'):
        print(f"🔑 Cache Key: {assessment['cache_key']}")

    print("\n" + "="*80 + "\n")


def main():
    """Example usage of the assessor client."""
    # Initialize client
    client = AssessorClient()

    print("🚀 AI Security Assessor - Example Client\n")

    # Check health
    try:
        health = client.health_check()
        print(f"✓ API is {health['status']}")
    except Exception as e:
        print(f"✗ API is not accessible: {e}")
        print("\nMake sure the service is running:")
        print("  python main.py")
        return

    # Example 1: Assess FileZilla
    print("\n📋 Example 1: Assessing FileZilla...")
    try:
        result = client.assess(
            product_name="FileZilla",
            company_name="Tim Kosse",
            sha1="e94803128b6368b5c2c876a782b1e88346356844"
        )
        print_assessment(result)
    except Exception as e:
        print(f"✗ Assessment failed: {e}")

    # Example 2: Assess 1Password
    print("\n📋 Example 2: Assessing 1Password...")
    try:
        result = client.assess(
            product_name="1Password",
            company_name="1Password"
        )
        print_assessment(result)
    except Exception as e:
        print(f"✗ Assessment failed: {e}")

    # Example 3: Cache retrieval workflow
    print("\n📋 Example 3: Cache Retrieval Workflow...")
    try:
        # Step 1: Perform assessment
        print("  Step 1: Performing assessment...")
        result = client.assess(
            product_name="Slack",
            company_name="Slack Technologies Inc."
        )
        cache_key = result.get('cache_key')
        print(f"  ✓ Assessment complete. Cache key: {cache_key[:32]}...")

        # Step 2: Retrieve from cache using the cache_key
        print(f"\n  Step 2: Retrieving from cache using cache_key...")
        cached = client.get_cached(cache_key)
        print(f"  ✓ Retrieved from cache!")
        print(f"     Product: {cached['product_name']}")
        print(f"     Trust Score: {cached['trust_score']['score']}/100")

        if '_cache_metadata' in cached:
            print(f"     Cached At: {cached['_cache_metadata']['cached_at']}")
            print(f"     Access Count: {cached['_cache_metadata']['access_count']}")
    except Exception as e:
        print(f"✗ Cache workflow failed: {e}")

    # Example 4: List cached assessments
    print("\n📋 Example 4: Listing all cached assessments...")
    try:
        cached = client.list_cached(limit=5)
        print(f"Found {cached['total']} cached assessments:")
        for item in cached['assessments']:
            print(f"  • {item['product_name']} ({item.get('company_name', 'N/A')}) - {item['cached_at']}")
            print(f"    Cache Key: {item['cache_key'][:32]}...")
            print(f"    Access Count: {item['access_count']}")
    except Exception as e:
        print(f"✗ Failed to list cache: {e}")


if __name__ == "__main__":
    main()
