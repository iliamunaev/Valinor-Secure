from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import hashlib
from cache import init_redis, close_redis, generate_cache_key, get_cached_response, set_cached_response

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
    "role": "CISO",
    "input": "https://filezilla-project.org",
  },
  "mode": "single",
  "models": [
    {
      "llm_model": "gpt-4.1-mini"
    }
  ]
}

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await init_redis()

@app.on_event("shutdown")
async def shutdown_event():
    await close_redis()

# Allow requests from frontend dev server
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/input")
# async def read_input():
#     return JSONResponse(content=INPUT_EXAMPLE)

# @app.post("/input")
# async def read_input():
#     return JSONResponse(content=INPUT_EXAMPLE)


# @app.post("/assess")
# async def assess():
#     return JSONResponse(content=ASSESS_EXAMPLE)

# NOT TESTED ************************

# Endpoint 1: URL from user as input
class URLInput(BaseModel):
    url: str

@app.post("/input")
async def read_url(input_data: URLInput):
    """
    Endpoint to receive a URL from the user.
    """
    cache_key = generate_cache_key("/input", {"url": input_data.url})

    # Check cache
    cached_response = await get_cached_response(cache_key)
    if cached_response:
        return JSONResponse(content=cached_response)

    # Process request
    response = {
        "message": "URL received successfully",
        "url": input_data.url,
        "status": "success"
    }

    # Cache the response
    await set_cached_response(cache_key, response)

    return JSONResponse(content=response)

class AssessInput(BaseModel):
    url: str
    # or other input fields

# Mock function for AI assessment
async def run_ai_assessment(url: str):
    """Mock AI assessment workflow - replace with actual implementation"""
    # TODO: Implement actual AI workflow
    return ASSESS_EXAMPLE

@app.post("/assess")
async def assess(input_data: AssessInput):
    # Generate cache key
    cache_key = generate_cache_key("/assess", {"url": input_data.url})

    # Check cache first
    cached_response = await get_cached_response(cache_key)
    if cached_response:
        return JSONResponse(content=cached_response)

    # Run AI workflow here
    response = await run_ai_assessment(input_data.url)

    # Cache the response
    await set_cached_response(cache_key, response)

    return JSONResponse(content=response)


# # Endpoint 2: Get CSV file from user
# @app.post("/input/csv")
# async def upload_csv(file: UploadFile = File(...)):
#     """
#     Endpoint to receive a CSV file from the user.
#     """
#     if not file.filename.endswith('.csv'):
#         return JSONResponse(
#             status_code=400,
#             content={"error": "File must be a CSV file"}
#         )

#     contents = await file.read()
#     file_size = len(contents)

#     # Generate cache key based on filename and file hash
#     file_hash = hashlib.md5(contents).hexdigest()
#     cache_key = generate_cache_key("/input/csv", {
#         "filename": file.filename,
#         "hash": file_hash
#     })

#     # Check cache
#     cached_response = await get_cached_response(cache_key)
#     if cached_response:
#         return JSONResponse(content=cached_response)

#     response = {
#         "message": "CSV file received successfully",
#         "filename": file.filename,
#         "file_size": file_size,
#         "content_type": file.content_type,
#         "status": "success"
#     }

#     # Cache the response
#     await set_cached_response(cache_key, response)

#     return JSONResponse(content=response)

# # Endpoint 3: Get string from chat
# class ChatInput(BaseModel):
#     message: str

# @app.post("/input/chat")
# async def get_chat_string(input_data: ChatInput):
#     """
#     Endpoint to receive a string message from chat.
#     """
#     # Generate cache key
#     cache_key = generate_cache_key("/input/chat", {"message": input_data.message})

#     # Check cache
#     cached_response = await get_cached_response(cache_key)
#     if cached_response:
#         return JSONResponse(content=cached_response)

#     response = {
#         "message": "Chat string received successfully",
#         "chat_message": input_data.message,
#         "status": "success"
#     }

#     # Cache the response
#     await set_cached_response(cache_key, response)

#     return JSONResponse(content=response)
