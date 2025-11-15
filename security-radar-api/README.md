# AI Security Assessor

A FastAPI-based service that turns application names or URLs into CISO-ready trust briefs with sources.

## Overview

This service provides automated security assessments for software applications, helping security teams and CISOs make informed decisions about tool approvals. Given minimal input (product name, vendor, or URL), the system generates comprehensive security posture summaries with citations.

## Features

- **Entity Resolution**: Identifies and resolves vendor/product identity
- **Software Classification**: Categorizes software into clear taxonomies
- **Security Posture Analysis**: CVE trends, incidents, compliance information
- **Trust Scoring**: 0-100 risk/trust score with detailed rationale
- **Alternative Suggestions**: Recommends safer alternatives when available
- **Local Caching**: SQLite-based cache for reproducible assessments
- **REST API**: Easy integration with existing workflows

## Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt
```

### Running the Service

#### Option 1: Run Locally

```bash
# Start the FastAPI server
python main.py

# Or use uvicorn directly
uvicorn src.main:app --reload --host 0.0.0.0 --port 8088
```

The service will be available at `http://localhost:8088`

#### Option 2: Run with Docker (Recommended)

```bash
# Using docker-compose (easiest)
docker-compose up

# Or using Makefile
make up

# Or build and run manually
docker build -t ai-security-assessor .
docker run -p 8088:8088 ai-security-assessor
```

The service will be available at `http://localhost:8088`

**Docker Development Mode** (with hot reload):
```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or using Makefile
make dev
```

### API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8088/docs`
- ReDoc: `http://localhost:8088/redoc`

## API Endpoints

### POST /assess

Assess a software application's security posture.

**Request Body:**
```json
{
  "product_name": "FileZilla",
  "company_name": "Tim Kosse",
  "sha1": "e94803128b6368b5c2c876a782b1e88346356844",
  "url": "https://filezilla-project.org"
}
```

**Response:**
```json
{
  "product_name": "FileZilla",
  "vendor": {
    "name": "Tim Kosse",
    "website": "https://filezilla-project.org",
    "reputation_summary": "..."
  },
  "category": "File Sharing",
  "description": "...",
  "trust_score": {
    "score": 65,
    "confidence": "Medium",
    "rationale": "...",
    "risk_factors": ["..."],
    "positive_factors": ["..."]
  },
  "cve_trends": {...},
  "compliance": {...},
  "alternatives": [...],
  "citations": [...]
}
```

### GET /cache/{identifier}

Retrieve a cached assessment by cache key.

### GET /cache

List all cached assessments with pagination.

### POST /assess/file

Upload a CSV file for batch assessment.

CSV format:
```
company_name,product_name,sha1
Tim Kosse,FileZilla,e94803128b6368b5c2c876a782b1e88346356844
```

### GET /health

Health check endpoint.

## Assessment Criteria

The assessor evaluates applications based on:

1. **Vendor Reputation**: Company history, security track record
2. **CVE Trends**: Vulnerability patterns and severity
3. **Incidents**: Known security breaches or abuse signals
4. **Compliance**: SOC2, ISO, GDPR, data handling practices
5. **Deployment Controls**: Admin capabilities, security features
6. **Public Evidence**: Quality and recency of available information

## Data Sources

The system prioritizes high-signal sources:
- Vendor security/PSIRT pages
- CVE/CVSS databases
- CISA KEV (Known Exploited Vulnerabilities)
- SOC2/ISO attestations
- CERT advisories
- Bug bounty programs
- Public disclosure databases

## Cache System

Assessments are cached locally in SQLite with:
- Deterministic cache keys
- Timestamps for auditability
- Access tracking
- Reproducible results

Cache location: `assessment_cache.db`

## Development

### Project Structure

```
.
├── main.py              # Main entry point for the service
├── requirements.txt     # Python dependencies
├── test_api.py          # Test script
├── example_client.py    # Example client usage
├── start_server.sh      # Quick start script
├── src/                 # Core service package
│   ├── __init__.py      # Package initialization
│   ├── main.py          # FastAPI application
│   ├── models.py        # Pydantic data models
│   ├── assessor.py      # Core assessment logic
│   ├── cache_service.py # SQLite cache service
│   └── config.py        # Configuration management
├── tests/               # Test suite
│   ├── __init__.py
│   ├── conftest.py      # Pytest fixtures and configuration
│   ├── test_models.py   # Unit tests for data models
│   ├── test_cache_service.py  # Unit tests for cache service
│   ├── test_assessor.py # Unit tests for assessor logic
│   ├── test_api.py      # API endpoint tests
│   └── test_integration.py # Integration tests
├── data/
│   └── example.csv      # Sample data
├── pytest.ini           # Pytest configuration
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore file
└── README.md
```

### Testing

The project includes a comprehensive test suite with 79+ tests covering:
- **Unit tests** for models, cache service, and assessor logic
- **API tests** for all endpoints
- **Integration tests** for end-to-end workflows

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_models.py

# Run with coverage report
pytest --cov=src --cov-report=html
pytest --cov=src --cov-report=term

# Using the test runner script
./run_tests.sh                  # Run all tests
./run_tests.sh unit             # Run unit tests only
./run_tests.sh integration      # Run integration tests only
./run_tests.sh api              # Run API tests only
./run_tests.sh coverage         # Run with coverage report
./run_tests.sh quick            # Run quick smoke tests
```

**Test Structure:**
- `tests/test_models.py` - Tests for Pydantic models (13 tests)
- `tests/test_cache_service.py` - Tests for SQLite cache (13 tests)
- `tests/test_assessor.py` - Tests for assessment logic (27 tests)
- `tests/test_api.py` - Tests for API endpoints (16 tests)
- `tests/test_integration.py` - End-to-end integration tests (10 tests)

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .
```

## Docker Deployment

The application is fully containerized and ready for production deployment.

### Prerequisites

- Docker 20.10+
- Docker Compose 1.29+ (optional, for easier management)

### Quick Start with Docker

```bash
# 1. Build the image
docker build -t ai-security-assessor .

# 2. Run the container
docker run -p 8088:8088 ai-security-assessor

# Access the API at http://localhost:8088
```

### Using Docker Compose (Recommended)

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down

# Restart
docker-compose restart
```

### Using Makefile (Easiest)

```bash
# Show all available commands
make help

# Production commands
make build          # Build production image
make up             # Start service
make down           # Stop service
make logs           # View logs
make restart        # Restart service
make test           # Run tests in container

# Development commands
make dev            # Start with hot reload
make shell          # Open shell in container
make health         # Check service health

# Cleanup
make clean          # Remove containers and images
make prune          # Clean all unused Docker resources
```

### Development with Docker

For local development with hot reload:

```bash
# Using docker-compose
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Using Makefile
make dev
```

Changes to source files will automatically reload the service.

### Docker Configuration

**Environment Variables:**

```bash
# Set via docker-compose.yml or command line
docker run -p 8088:8088 \
  -e APP_NAME="My Assessor" \
  -e DEBUG=False \
  -e CACHE_DB_PATH=/app/data/cache.db \
  ai-security-assessor
```

**Persistent Storage:**

```bash
# Mount volume for cache persistence
docker run -p 8088:8088 \
  -v $(pwd)/data:/app/data \
  ai-security-assessor
```

**Using .env file:**

```bash
# Copy example env file
cp .env.example .env

# Edit with your configuration
vim .env

# Mount in docker-compose.yml (uncomment the volume)
volumes:
  - ./.env:/app/.env:ro
```

### Docker Image Details

- **Base Image:** Python 3.11-slim
- **Size:** ~340MB (optimized multi-stage build)
- **Architecture:** linux/amd64, linux/arm64 (multi-arch support)
- **User:** Non-root user (assessor:1000)
- **Health Check:** Built-in health endpoint monitoring
- **Port:** 8088

### Production Deployment

**Deploy to Docker Swarm:**

```bash
docker stack deploy -c docker-compose.yml assessor-stack
```

**Deploy to Kubernetes:**

```bash
# Generate Kubernetes manifests
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f .
```

**Environment-specific builds:**

```bash
# Build with specific tag
./docker-build.sh production v1.0.0

# Tag for registry
docker tag ai-security-assessor:v1.0.0 registry.example.com/ai-security-assessor:v1.0.0

# Push to registry
docker push registry.example.com/ai-security-assessor:v1.0.0
```

### Monitoring and Health Checks

```bash
# Check container health
docker ps
docker inspect assessor-api | grep -A 10 Health

# View health endpoint
curl http://localhost:8088/health

# Monitor resource usage
docker stats assessor-api

# View real-time logs
docker-compose logs -f api
```

### Troubleshooting

**Container won't start:**
```bash
# Check logs
docker-compose logs api

# Verify port availability
lsof -i :8088

# Check container status
docker-compose ps
```

**Permission issues:**
```bash
# Ensure proper permissions on volumes
chown -R 1000:1000 ./data
```

**Cache persistence:**
```bash
# Verify volume
docker volume ls
docker volume inspect assesor-llm_cache_data

# Backup cache
docker run --rm -v assesor-llm_cache_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/cache-backup.tar.gz -C /data .
```

## Current Implementation Status

This is a **skeleton implementation** providing the basic structure and API endpoints. The current version:

✅ Provides REST API endpoints
✅ Implements request/response models
✅ Includes SQLite caching with timestamps
✅ Offers basic software classification
✅ Returns structured assessment format

🚧 **To be implemented** for full functionality:
- CVE database integration
- Web scraping for vendor security pages
- CISA KEV checks
- Compliance documentation analysis
- LLM-powered entity resolution
- Trust score calculation algorithm
- Alternative product recommendations
- Citation gathering and verification

## Future Enhancements

- [ ] Integration with CVE databases (NVD, MITRE)
- [ ] Web scraping for vendor security pages
- [ ] LLM-powered analysis and synthesis
- [ ] Web UI with compare view
- [ ] Batch processing for CSV uploads
- [ ] MCP service assessment capability
- [ ] Enhanced caching strategies
- [ ] Export to PDF/Word formats

## License

See LICENSE file for details.

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.
