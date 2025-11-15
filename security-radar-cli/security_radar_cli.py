#!/usr/bin/env python3
"""
Security Radar CLI - Command-line client for the Security Radar API

This CLI tool allows you to assess software applications' security posture
from the command line.
"""

import argparse
import json
import os
import sys
from typing import Optional
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class SecurityRadarCLI:
    """CLI client for the Security Radar API."""

    def __init__(self, base_url: Optional[str] = None):
        """Initialize CLI client with API base URL."""
        self.base_url = base_url or os.getenv("API_URL", "http://localhost:8088")

    def assess(
        self,
        product_name: str,
        company_name: Optional[str] = None,
        url: Optional[str] = None,
        sha1: Optional[str] = None,
        force_refresh: bool = False,
        output_format: str = "text"
    ) -> int:
        """
        Request a security assessment for a software product.

        Args:
            product_name: Name of the product
            company_name: Vendor/company name (optional)
            url: Product or vendor URL (optional)
            sha1: SHA-1 hash of binary (optional)
            force_refresh: Force refresh from cache (optional)
            output_format: Output format (text or json)

        Returns:
            Exit code (0 for success, 1 for failure)
        """
        # Build request payload
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

        try:
            # Make API request
            response = requests.post(
                f"{self.base_url}/assess",
                json=payload,
                timeout=300  # 5 minute timeout for assessment
            )
            response.raise_for_status()
            assessment = response.json()

            # Output results
            if output_format == "json":
                print(json.dumps(assessment, indent=2))
            else:
                self._print_text_assessment(assessment)

            return 0

        except requests.exceptions.ConnectionError:
            print(f"ERROR: Could not connect to API at {self.base_url}", file=sys.stderr)
            print("Make sure the Security Radar API is running.", file=sys.stderr)
            return 1
        except requests.exceptions.Timeout:
            print("ERROR: Request timed out. The assessment is taking too long.", file=sys.stderr)
            return 1
        except requests.exceptions.HTTPError as e:
            print(f"ERROR: HTTP {e.response.status_code} - {e.response.reason}", file=sys.stderr)
            try:
                error_detail = e.response.json()
                print(f"Details: {error_detail.get('detail', 'Unknown error')}", file=sys.stderr)
            except:
                pass
            return 1
        except Exception as e:
            print(f"ERROR: {str(e)}", file=sys.stderr)
            return 1

    def _print_text_assessment(self, assessment: dict):
        """Pretty print an assessment in text format."""
        print("\n" + "="*80)
        print(f"SECURITY ASSESSMENT: {assessment['product_name']}")
        print("="*80)

        # Product Information
        print(f"\nPRODUCT INFORMATION")
        print(f"  Name: {assessment['product_name']}")
        print(f"  Vendor: {assessment['vendor']['name']}")
        print(f"  Category: {assessment['category']}")

        if assessment['vendor'].get('website'):
            print(f"  Website: {assessment['vendor']['website']}")
        if assessment['vendor'].get('country'):
            print(f"  Country: {assessment['vendor']['country']}")

        print(f"\n  Description: {assessment['description']}")
        print(f"  Usage: {assessment['usage_description']}")

        # Trust Score
        print(f"\nTRUST SCORE")
        score = assessment['trust_score']
        score_value = score['score']

        # Add visual indicator
        if score_value >= 80:
            indicator = "HIGH"
        elif score_value >= 60:
            indicator = "MEDIUM"
        elif score_value >= 40:
            indicator = "LOW"
        else:
            indicator = "CRITICAL"

        print(f"  Score: {score_value}/100 [{indicator}]")
        print(f"  Confidence: {score['confidence']}")
        print(f"  Rationale: {score['rationale']}")

        if score.get('risk_factors'):
            print(f"\n  Risk Factors:")
            for factor in score['risk_factors']:
                print(f"    - {factor}")

        if score.get('positive_factors'):
            print(f"\n  Positive Factors:")
            for factor in score['positive_factors']:
                print(f"    + {factor}")

        # Security Posture
        print(f"\nSECURITY POSTURE")
        cve = assessment['cve_trends']
        print(f"  CVE Summary: {cve['trend_summary']}")

        if cve['total_cves'] > 0:
            print(f"  Total CVEs: {cve['total_cves']}")
            print(f"    - Critical: {cve['critical_count']}")
            print(f"    - High: {cve['high_count']}")
            print(f"    - Medium: {cve['medium_count']}")
            print(f"    - Low: {cve['low_count']}")

            if cve.get('recent_cves') and len(cve['recent_cves']) > 0:
                print(f"\n  Recent CVEs:")
                for recent_cve in cve['recent_cves'][:5]:  # Show up to 5
                    cve_id = recent_cve.get('id', 'N/A')
                    severity = recent_cve.get('severity', 'N/A')
                    description = recent_cve.get('description', 'N/A')
                    print(f"    - {cve_id} [{severity}]: {description}")

        # Incidents
        if assessment.get('incidents') and len(assessment['incidents']) > 0:
            print(f"\n  Security Incidents: {len(assessment['incidents'])}")
            for incident in assessment['incidents'][:3]:  # Show up to 3
                print(f"    - [{incident['severity']}] {incident['description']}")
                if incident.get('date'):
                    print(f"      Date: {incident['date']}")

        # Compliance
        compliance = assessment['compliance']
        print(f"\nCOMPLIANCE & DATA HANDLING")
        print(f"  Notes: {compliance['notes']}")

        if compliance.get('soc2_compliant') is not None:
            print(f"  SOC2 Compliant: {'Yes' if compliance['soc2_compliant'] else 'No'}")
        if compliance.get('iso_certified') is not None:
            print(f"  ISO Certified: {'Yes' if compliance['iso_certified'] else 'No'}")
        if compliance.get('gdpr_compliant') is not None:
            print(f"  GDPR Compliant: {'Yes' if compliance['gdpr_compliant'] else 'No'}")
        if compliance.get('data_processing_location'):
            print(f"  Data Processing: {compliance['data_processing_location']}")
        if compliance.get('encryption_at_rest') is not None:
            print(f"  Encryption at Rest: {'Yes' if compliance['encryption_at_rest'] else 'No'}")
        if compliance.get('encryption_in_transit') is not None:
            print(f"  Encryption in Transit: {'Yes' if compliance['encryption_in_transit'] else 'No'}")

        # Deployment
        if assessment.get('deployment_model'):
            print(f"\nDEPLOYMENT")
            print(f"  Model: {assessment['deployment_model']}")
        if assessment.get('admin_controls'):
            print(f"  Admin Controls: {assessment['admin_controls']}")

        # Alternatives
        if assessment.get('alternatives') and len(assessment['alternatives']) > 0:
            print(f"\nALTERNATIVES")
            for alt in assessment['alternatives']:
                score_str = f" (Trust Score: {alt['trust_score']}/100)" if alt.get('trust_score') else ""
                print(f"  - {alt['product_name']} by {alt['vendor']}{score_str}")
                print(f"    {alt['rationale']}")

        # Metadata
        print(f"\nMETADATA")
        print(f"  Assessment Time: {assessment['assessment_timestamp']}")
        if assessment.get('cache_key'):
            print(f"  Cache Key: {assessment['cache_key'][:40]}...")

        # Citations
        if assessment.get('citations') and len(assessment['citations']) > 0:
            print(f"\n  Citations: {len(assessment['citations'])} sources")
            for i, citation in enumerate(assessment['citations'][:5], 1):  # Show up to 5
                print(f"    {i}. [{citation['source_type']}] {citation['title']}")
                if citation.get('url'):
                    print(f"       {citation['url']}")

        print("\n" + "="*80 + "\n")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Security Radar CLI - Assess software applications' security posture",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Assess a product by name
  %(prog)s assess --product "FileZilla"

  # Assess with company name
  %(prog)s assess --product "FileZilla" --company "Tim Kosse"

  # Assess with SHA-1 hash
  %(prog)s assess --product "FileZilla" --sha1 "e94803128b6368b5c2c876a782b1e88346356844"

  # Get JSON output
  %(prog)s assess --product "1Password" --format json

  # Use custom API URL
  %(prog)s --api-url http://api.example.com:8088 assess --product "Slack"
        """
    )

    parser.add_argument(
        "--api-url",
        default=os.getenv("API_URL", "http://localhost:8088"),
        help=f"Base URL of the Security Radar API (default: {os.getenv('API_URL', 'http://localhost:8088')})"
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Assess command
    assess_parser = subparsers.add_parser(
        "assess",
        help="Assess a software product's security posture"
    )
    assess_parser.add_argument(
        "--product",
        required=True,
        help="Name of the software product (required)"
    )
    assess_parser.add_argument(
        "--company",
        help="Vendor/company name (optional)"
    )
    assess_parser.add_argument(
        "--url",
        help="Product or vendor URL (optional)"
    )
    assess_parser.add_argument(
        "--sha1",
        help="SHA-1 hash of the binary (optional)"
    )
    assess_parser.add_argument(
        "--force-refresh",
        action="store_true",
        help="Force refresh from cache (optional)"
    )
    assess_parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)"
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    # Initialize CLI client
    cli = SecurityRadarCLI(base_url=args.api_url)

    # Execute command
    if args.command == "assess":
        return cli.assess(
            product_name=args.product,
            company_name=args.company,
            url=args.url,
            sha1=args.sha1,
            force_refresh=args.force_refresh,
            output_format=args.format
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
