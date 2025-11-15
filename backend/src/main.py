from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from typing import List

class MetaModel(BaseModel):
    generated_at: str
    user_id: str
    user_name: str
    role: str
    input: str

class ModelItem(BaseModel):
    llm_model: str

class InputPayload(BaseModel):
    meta: MetaModel
    mode: str
    models: List[ModelItem]

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
#need to send it to user

app = FastAPI()

# Allow requests from frontend dev server
origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/input")
async def receive_input(payload: InputPayload):
    """
    Receives the real INPUT_EXAMPLE-like JSON from frontend.
    """
    print("📥 Received /input payload:", payload.dict())

    return JSONResponse(content={
        "status": "ok",
        "received": payload.dict()
    })


@app.post("/assess")
async def assess():
    return JSONResponse(content=ASSESS_EXAMPLE)

# Endpoint 1: Read URL from user as input
class URLInput(BaseModel):
    url: str

@app.post("/input/url")
async def read_url(input_data: URLInput):
    """
    Endpoint to receive a URL from the user.
    """
    return JSONResponse(content={
        "message": "URL received successfully",
        "url": input_data.url,
        "status": "success"
    })

# Endpoint 2: Get CSV file from user
@app.post("/input/csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Endpoint to receive a CSV file from the user.
    """
    if not file.filename.endswith('.csv'):
        return JSONResponse(
            status_code=400,
            content={"error": "File must be a CSV file"}
        )

    contents = await file.read()
    file_size = len(contents)

    return JSONResponse(content={
        "message": "CSV file received successfully",
        "filename": file.filename,
        "file_size": file_size,
        "content_type": file.content_type,
        "status": "success"
    })

# Endpoint 3: Get string from chat
class ChatInput(BaseModel):
    message: str

@app.post("/input/chat")
async def get_chat_string(input_data: ChatInput):
    """
    Endpoint to receive a string message from chat.
    """
    return JSONResponse(content={
        "message": "Chat string received successfully",
        "chat_message": input_data.message,
        "status": "success"
    })
