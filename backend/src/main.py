from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

ASSESS_EXAMPLE = {
  "meta": {
    "generated_at": "2025-11-15T10:05:23Z",
    "mode": "online",
    "input": "https://app.acmecloud.example",
    "llm_model": "gpt-4.1-mini"
  },
  "entity": {
    "product_name": "AcmeCloud CRM",
    "vendor_name": "AcmeCloud Inc.",
    "vendor_website": "https://www.acmecloud.example"
  },
  "classification": {
    "category": "SaaS – CRM",
    "delivery_model": "SaaS",
    "short_description": "AcmeCloud CRM is a cloud-based customer relationship management tool for small and mid-sized businesses."
  },
  "summary": {
    "trust_score": 68,
    "risk_level": "Medium",
    "confidence": "Medium",
    "key_points": [
      "Public security page and basic vulnerability disclosure program are available. [1]",
      "Several medium/high CVEs in the last 12 months, but no KEV-listed vulnerabilities. [2][3]",
      "SOC 2 Type II declared; ISO27001 status not clearly documented. [1]",
      "SSO and RBAC supported; audit logs can be exported. [1]"
    ]
  },
  "cve": {
    "count_last_12m": 4,
    "max_cvss": 8.2,
    "cisa_kev": {
      "has_kev": False,
      "kev_cves": []
    },
    "comment": "Moderate vulnerability history with some high-severity issues but no known KEV-listed vulnerabilities in the last 12 months."
  },
  "incidents": {
    "known_incidents_last_24m": "No",
    "items": [],
    "comment": "No major public incidents identified in the last 24 months based on open-source searches. Data may be incomplete."
  },
  "data_compliance": {
    "data_types": [
      "PII (names, emails, phone numbers)",
      "Business customer records"
    ],
    "dpa_available": "Yes",
    "soc2": "Yes",
    "iso27001": "Unknown",
    "data_location": "US/EU (mixed, limited EU residency options)"
  },
  "controls": {
    "sso": "Yes",
    "mfa": "Yes",
    "rbac": "Yes",
    "audit_logs": "Yes"
  },
  "alternatives": [
    {
      "product_name": "SafeCloud CRM",
      "vendor_name": "SafeCloud Ltd.",
      "trust_score": 78,
      "risk_level": "Low",
      "why_safer": [
        "Fewer recent CVEs and no high-severity issues in the last 12 months. [4][5]",
        "SOC2 and ISO27001 both declared with public summaries. [4]",
        "Clear EU data residency and stronger privacy posture. [5]"
      ]
    }
  ],
  "sources": [
    {
      "id": 1,
      "type": "vendor",
      "title": "AcmeCloud Security & Trust Center",
      "url": "https://www.acmecloud.example/security"
    },
    {
      "id": 2,
      "type": "independent",
      "title": "CVE entries for \"AcmeCloud CRM\"",
      "url": "https://cve.example.org/?vendor=acmecloud&product=crm"
    },
    {
      "id": 3,
      "type": "independent",
      "title": "CISA KEV search for \"AcmeCloud\"",
      "url": "https://www.cisa.gov/known-exploited-vulnerabilities"
    },
    {
      "id": 4,
      "type": "vendor",
      "title": "SafeCloud Trust Center",
      "url": "https://trust.safecloud.example"
    },
    {
      "id": 5,
      "type": "independent",
      "title": "SafeCloud CRM security/compliance review",
      "url": "https://reviews.example.org/safecloud-crm-security"
    }
  ]
}

INPUT_EXAMPLE = {
  "meta": {
    "generated_at": "2025-11-15T10:05:23Z",
    "user_id": "5353787fj7ssdfd",
    "user_name": "default_name",
    "role": "refault_role",
    "input": "https://app.acmecloud.example",
  },
  "models": [
    {
      "llm_model": "gpt-4.1-mini"
    },
    {
      "llm_model": "gpt-4-turbo"
    }
  ]
}

app = FastAPI()

# Allow requests from frontend dev server
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/api/hello")
# def read_root():
#   return {
#       "message": "Hello from TEST FastAPI Test! Test!",
#       "test_backend": os.getenv("TEST_BACKEND", "undefined"),
#   }

@app.get("/input")
async def read_input():
    return JSONResponse(content=INPUT_EXAMPLE)

@app.post("/assess")
async def assess():
    return JSONResponse(content=ASSESS_EXAMPLE)
