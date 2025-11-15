"""
AI Security Assessor - Main Entry Point

Run this file to start the FastAPI service.
"""

import uvicorn
from src.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8088)
