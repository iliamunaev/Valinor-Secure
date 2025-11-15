# Multi-stage Dockerfile for AI Security Assessor

# Stage 1: Builder
FROM python:3.11-slim AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim

# Set metadata
LABEL maintainer="AI Security Assessor Team"
LABEL description="CISO-ready trust brief generation service"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN useradd -m -u 1000 assessor && \
    chown -R assessor:assessor /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set environment variables
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8088

# Copy application code
COPY --chown=assessor:assessor . .

# Switch to non-root user
USER assessor

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8088/health')" || exit 1

# Expose port
EXPOSE 8088

# Run the application
CMD ["python", "main.py"]
