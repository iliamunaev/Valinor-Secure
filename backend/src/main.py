from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os

ASSESS_EXAMPLE = {
  "vendor": {
    "name": "Cloudflare, Inc.",
    "website": "https://www.cloudflare.com/",
    "country": "United States",
    "founded": "2009",
    "reputation_summary": "Cloudflare is a reputable company known for providing web infrastructure and website security services."
  },
  "category": "Security Tool",
  "description": "Cloudflare is a web infrastructure and website security company, providing content delivery network services, DDoS mitigation, Internet security, and distributed domain name server services.",
  "usage_description": "Cloudflare is used to protect and accelerate any website online. Once your website is a part of the Cloudflare community, its web traffic is routed through their intelligent global network.",
  "cve_trends": {
    "total_cves": 10,
    "critical_count": 2,
    "high_count": 3,
    "medium_count": 4,
    "low_count": 1,
    "recent_cves": [
      {
        "id": "CVE-2020-11501",
        "severity": "High",
        "description": "Cloudflare Workers and Workers KV had a time-of-check-time-of-use (TOCTOU) bug that could allow a Worker to read old versions of KV values."
      }
    ],
    "trend_summary": "Cloudflare has a moderate number of CVEs, but they are responsive in addressing them."
  },
  "incidents": [
    {
      "date": "2020-07-17",
      "description": "Cloudflare experienced a global outage that lasted for 27 minutes due to a massive spike in CPU utilization on their network.",
      "severity": "High",
      "source_type": "Public Disclosure",
      "source_url": "https://blog.cloudflare.com/cloudflare-outage/",
      "source_title": "Cloudflare Outage"
    }
  ],
  "compliance": {
    "soc2_compliant": "true",
    "iso_certified": "true",
    "gdpr_compliant": "true",
    "data_processing_location": "United States",
    "encryption_at_rest": "true",
    "encryption_in_transit": "true",
    "data_retention_policy": "Cloudflare retains data as necessary to provide its services, comply with legal obligations, resolve disputes, and enforce its agreements.",
    "notes": "Cloudflare has a strong commitment to privacy and data protection."
  },
  "deployment_model": "Cloud",
  "admin_controls": "Cloudflare provides comprehensive admin controls including traffic control, security settings, performance settings, and network settings.",
  "trust_score": {
    "score": 85,
    "confidence": "High",
    "rationale": "Cloudflare has a strong reputation, robust security measures, and is compliant with major regulations. However, past incidents and CVEs slightly impact the score.",
    "risk_factors": ["Past security incidents", "CVE history"],
    "positive_factors": ["Strong vendor reputation", "Compliance certifications", "Robust security measures"]
  },
  "alternatives": [
    {
      "product_name": "Akamai",
      "vendor": "Akamai Technologies",
      "rationale": "Akamai has a similar range of services with a slightly better security track record.",
      "trust_score": 88
    }
  ],
  "citations": [
    {
      "url": "https://www.cloudflare.com/",
      "source_type": "Vendor Stated",
      "title": "Cloudflare Official Website",
      "date": "2022-01-01",
      "description": "Official website of Cloudflare."
    },
    {
      "url": "https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2020-11501",
      "source_type": "CVE Database",
      "title": "CVE-2020-11501",
      "date": "2020-04-15",
      "description": "Details of CVE-2020-11501."
    },
    {
      "url": "https://blog.cloudflare.com/cloudflare-outage/",
      "source_type": "Public Disclosure",
      "title": "Cloudflare Outage",
      "date": "2020-07-17",
      "description": "Details of the Cloudflare outage incident."
    }
  ]
}

INPUT_EXAMPLE = {
  "meta": {
    "generated_at": "2025-11-15T10:05:23Z",
    "user_id": "5353787fj7ssdfd",
    "user_name": "default_name",
    "role": "CISO",
  },
  "input": {
      "company_name": "Cloudflare, Inc.",
      "url": "https://www.cloudflare.com/"
  },
  "mode": "single",
  "models": [
    {
      "llm_model": "gpt-4.1-mini"
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

@app.get("/input")
async def read_input():
    return JSONResponse(content=INPUT_EXAMPLE)

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

class ChatResponse(BaseModel):
    message: str
    status: str
    timestamp: str

def generate_chat_response(user_message: str) -> str:
    """
    Generate a contextual response based on the user's message.
    This is a placeholder that can be replaced with actual LLM integration.
    """
    message_lower = user_message.lower()

    # Simple keyword-based responses
    if any(word in message_lower for word in ["hello", "hi", "hey", "greetings"]):
        return "Hello! I'm your security assessment assistant. How can I help you today?"

    elif any(word in message_lower for word in ["help", "what can you do", "capabilities"]):
        return """I can help you with security assessments! Here's what I can do:

• Analyze vendor security profiles
• Assess CVE trends and vulnerabilities
• Check compliance certifications
• Evaluate trust scores
• Provide security recommendations

Try asking me to assess a company or upload a CSV file with vendor information."""

    elif any(word in message_lower for word in ["assess", "analyze", "check", "evaluate"]):
        return "I can help you assess a vendor's security profile. Please provide a company name or URL, or you can upload a CSV file with vendor information to assess multiple vendors at once."

    elif any(word in message_lower for word in ["cloudflare", "vendor", "company"]):
        return "To assess a vendor like Cloudflare, I'll need their company name and website URL. I can provide information about their security posture, CVE trends, compliance certifications, and trust score."

    elif any(word in message_lower for word in ["csv", "upload", "file", "bulk"]):
        return "You can upload a CSV file with vendor information for bulk assessment. The CSV should contain columns like company name, website URL, and any other relevant vendor details."

    elif any(word in message_lower for word in ["thank", "thanks"]):
        return "You're welcome! Let me know if you need anything else."

    else:
        return f"""I received your message: "{user_message}"

I'm your security assessment assistant. I can help you analyze vendor security profiles, check CVE trends, and evaluate trust scores.

Would you like me to assess a specific vendor, or would you like to know more about my capabilities?"""

@app.post("/input/chat")
async def get_chat_string(input_data: ChatInput):
    """
    Endpoint to receive a string message from chat and return a contextual response.
    """
    from datetime import datetime

    # Generate a response based on the user's message
    response_message = generate_chat_response(input_data.message)

    return JSONResponse(content={
        "message": response_message,
        "status": "success",
        "timestamp": datetime.now().isoformat()
    })
