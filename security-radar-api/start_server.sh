#!/bin/bash

# AI Security Assessor - Start Script

echo "🚀 Starting AI Security Assessor Service..."
echo ""
echo "API will be available at:"
echo "  - Main API: http://localhost:8000"
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - ReDoc: http://localhost:8000/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the service
python main.py
