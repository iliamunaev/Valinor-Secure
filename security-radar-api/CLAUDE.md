# CLAUDE.md - AI Assistant Guide

This document helps AI assistants (like Claude) understand and work with the Security Radar API project efficiently.

## Project Overview

**Security Radar API** is a FastAPI-based service that performs comprehensive security assessments of software products using LLM APIs. It analyzes CVE trends, compliance, security incidents, and generates trust scores for software used in enterprise environments.

### Key Capabilities
- Security assessment of software products via LLM analysis
- CVE trend analysis and trust score calculation
- Software classification (17 categories)
- Compliance checking (SOC2, ISO, GDPR)
- Caching layer for performance
- Request/response logging for quality checks
- Support for multiple LLM providers (OpenAI, Anthropic)

### Tech Stack
- **Framework**: FastAPI 0.109.0
- **Python**: 3.11, 3.12
- **Database**: SQLite (cache)
- **Testing**: pytest, tox
- **LLM APIs**: OpenAI, Anthropic

## Project Structure

```
security-radar-api/
├── src/                          # Main application code
│   ├── main.py                   # FastAPI app & endpoints
│   ├── assessor.py              # Core assessment logic (LLM integration)
│   ├── models.py                # Pydantic data models
│   ├── config.py                # Configuration & settings
│   ├── cache_service.py         # SQLite caching layer
│   └── request_logger.py        # Request/response logging
├── tests/                        # Test suite (79 tests)
│   ├── conftest.py              # Test fixtures & mocking
│   ├── test_assessor.py         # Assessor tests (27)
│   ├── test_api.py              # API endpoint tests (16)
│   ├── test_cache_service.py    # Cache tests (13)
│   ├── test_integration.py      # Integration tests (10)
│   └── test_models.py           # Model validation (13)
├── .env                         # Environment variables (API keys)
├── requirements.txt             # Python dependencies
├── pytest.ini                   # Pytest configuration
├── tox.ini                      # Tox test environments
├── Dockerfile                   # Production container
├── docker-compose.yml           # Production deployment
├── TESTING.md                   # Testing guide
├── LOG_FORMAT.md               # Logging documentation
└── CLAUDE.md                    # This file

Generated files (gitignored):
├── assessment_cache.db          # SQLite cache database
└── api_request_log.txt         # Request/response logs
```

## Key Files Explained

### src/main.py
FastAPI application with endpoints:
- `POST /assess` - Main assessment endpoint
- `GET /cache/{id}` - Retrieve cached assessment
- `GET /cache` - List all cached assessments (paginated)
- `GET /logs/stats` - Log file statistics
- `GET /health` - Health check

Runs on port **8088** (not 8000!)

### src/assessor.py
Core assessment engine:
- `assess()` - Main method that orchestrates LLM calls
- `_call_llm()` - Routes to OpenAI or Anthropic based on model name
- `_create_assessment_prompt()` - Generates structured prompt
- `_parse_llm_response()` - Parses JSON from LLM into AssessmentResponse
- `_classify_software()` - Keyword-based category classification
- `_calculate_trust_score()` - Trust score algorithm (unused in current flow)

**Important**: Tests automatically mock `_call_llm()` to avoid real API calls!

### src/models.py
Pydantic models:
- `AssessmentRequest` - Input model with product info + optional model name
- `AssessmentResponse` - Complete assessment with all fields
- `SoftwareCategory` - 17 category enum
- `TrustScore`, `CVETrend`, `ComplianceInfo`, etc.

### src/config.py
Settings (loaded from .env):
- API keys: `openai_api_key`, `anthropic_api_key`
- Default model: `llm_model` (default: "gpt-4")
- Logging: `enable_request_logging`, `request_log_file`
- Cache: `cache_db_path`, `cache_ttl_days`

### src/cache_service.py
SQLite-based caching:
- Generates cache keys using SHA256 hash
- Tracks access counts and timestamps
- Supports search and pagination
- TTL-based cleanup (30 days default)

### src/request_logger.py
Quality check logging:
- Logs every request, LLM interaction, and response
- Thread-safe file operations
- Structured text format (not JSON)
- Disabled during tests (`TESTING=true`)

### tests/conftest.py
**Critical for fast tests!**
- Sets `TESTING=true` and `ENABLE_REQUEST_LOGGING=false`
- Defines `mock_llm_response` with realistic test data
- **Auto-patches** `SecurityAssessor._call_llm()` via `autouse=True` fixture
- All tests run with mocks (no real API calls)

## Configuration

### Environment Variables (.env)

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8088
DEBUG=false

# LLM APIs
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.1

# Logging
ENABLE_REQUEST_LOGGING=true
REQUEST_LOG_FILE=api_request_log.txt

# Cache
CACHE_DB_PATH=assessment_cache.db
CACHE_TTL_DAYS=30

# Testing (set by conftest.py)
TESTING=false
```

### Model Selection Logic

The API automatically routes to the correct provider:

```python
# Uses OpenAI (default)
{"product_name": "Zoom"}

# Uses OpenAI with custom model
{"product_name": "Zoom", "model": "gpt-3.5-turbo"}

# Uses Anthropic (contains "claude" in name)
{"product_name": "Zoom", "model": "claude-3-opus-20240229"}
```

Logic in `assessor.py:184`:
```python
is_anthropic = any(x in model.lower() for x in ['claude', 'anthropic'])
```

## Common Tasks

### Running the Application

```bash
# Development server
python main.py
# or
uvicorn src.main:app --host 0.0.0.0 --port 8088 --reload

# Docker
docker-compose up

# Access at: http://localhost:8088
# API docs: http://localhost:8088/docs
```

### Running Tests

```bash
# All tests (fast, with mocks)
pytest tests/ -v                  # 79 tests in ~0.8s

# Specific test file
pytest tests/test_assessor.py -v  # 27 tests in ~0.5s

# With tox (recommended before commits)
tox -e py311                      # Test with Python 3.11
tox -e coverage                   # With coverage report
tox -e quick                      # Fast smoke tests

# Real API calls (slow, for manual verification)
TESTING=false pytest tests/test_assessor.py::TestSecurityAssessor::test_assess_basic -v -s
```

### Making an Assessment Request

```bash
# Via curl
curl -X POST http://localhost:8088/assess \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Slack",
    "company_name": "Slack Technologies",
    "model": "gpt-4"
  }'

# Via Python
import requests
response = requests.post("http://localhost:8088/assess", json={
    "product_name": "Zoom",
    "company_name": "Zoom Video Communications"
})
print(response.json())
```

### Checking Logs

```bash
# View request/response logs
cat api_request_log.txt

# View log stats via API
curl http://localhost:8088/logs/stats

# Find specific product
grep "product_name.*Zoom" api_request_log.txt

# Check LLM response times
grep "Duration:" api_request_log.txt
```

### Cache Operations

```bash
# List cached assessments
curl http://localhost:8088/cache

# Get specific cached item
curl http://localhost:8088/cache/{cache_key}

# Clear old cache entries (30+ days)
# Happens automatically on startup
```

## Development Workflow

### Adding a New Endpoint

1. Add endpoint to `src/main.py`
2. Add corresponding test to `tests/test_api.py`
3. Run tests: `pytest tests/test_api.py -v`
4. Update API documentation if needed

### Modifying Assessment Logic

1. **IMPORTANT**: Update mock data in `tests/conftest.py` first!
2. Modify `src/assessor.py`
3. Update tests in `tests/test_assessor.py`
4. Run tests: `pytest tests/test_assessor.py -v`
5. Test with real API manually if needed

### Adding New Models

1. Add to `src/models.py`
2. Add validation tests to `tests/test_models.py`
3. Run: `pytest tests/test_models.py -v`

### Changing Mock Response

Edit `tests/conftest.py`:
```python
@pytest.fixture
def mock_llm_response():
    return json.dumps({
        "vendor": {"name": "New Test Vendor", ...},
        "trust_score": {"score": 80, ...},  # Change score
        # ... update other fields
    })
```

Then update test expectations to match.

## Testing Guidelines

### Test Philosophy
- **Unit tests**: Test individual functions (classification, trust score calc)
- **Integration tests**: Test complete workflows with mocked LLMs
- **API tests**: Test endpoints via TestClient
- **NO real API calls in automated tests!**

### Test Mocking (Critical!)

All tests use automatic mocking via `conftest.py`:

```python
@pytest.fixture(autouse=True)  # ← autouse=True is critical!
def mock_assessor_llm(monkeypatch, mock_llm_call):
    monkeypatch.setattr(
        "src.assessor.SecurityAssessor._call_llm",
        mock_llm_call
    )
```

This ensures:
- Tests run in ~0.8 seconds (not 10+ minutes)
- No API costs
- Consistent results
- Works without API keys

### Test Data Expectations

When writing tests, use these values from the mock:

```python
assert result.vendor.name == "Test Vendor"  # Not real vendor name!
assert result.trust_score.score == 75
assert result.cve_trends.total_cves == 5
assert result.compliance.soc2_compliant == True
```

### Writing New Tests

```python
@pytest.mark.asyncio
async def test_my_feature(assessor, sample_request):
    # Mocking is automatic - just call assess()
    result = await assessor.assess(sample_request)

    # Verify structure and types
    assert result.product_name == sample_request.product_name
    assert isinstance(result.trust_score.score, int)
    assert 0 <= result.trust_score.score <= 100

    # Verify mock data
    assert result.trust_score.score == 75  # From mock
```

## Important Notes & Gotchas

### 1. Port Number
⚠️ **The API runs on port 8088, NOT 8000!**
- Defined in `main.py:146`: `uvicorn.run(app, host="0.0.0.0", port=8088)`
- Update clients accordingly

### 2. Test Mocking is Automatic
✅ **Do NOT manually mock LLM calls in tests!**
- The `autouse=True` fixture handles it
- If tests are slow, check `TESTING=true` is set
- Clear pytest cache if issues: `rm -rf .pytest_cache`

### 3. Model Name Routing
🔄 **Model selection is based on name detection:**
- Contains "claude" or "anthropic" → Uses Anthropic API
- Otherwise → Uses OpenAI API
- No explicit provider parameter needed

### 4. Cache Keys
🔑 **Cache keys are deterministic SHA256 hashes:**
- Based on: `product_name|company_name|sha1|url`
- Same inputs = same cache key
- Used for deduplication

### 5. Logging During Tests
📝 **Logging is disabled in tests:**
- `conftest.py` sets `ENABLE_REQUEST_LOGGING=false`
- Prevents log file pollution during test runs
- Re-enable manually if debugging

### 6. Git Ignored Files
🚫 **These files are gitignored but required:**
- `.env` - API keys (copy from `.env.example` if exists)
- `assessment_cache.db` - Generated on first run
- `api_request_log.txt` - Generated when logging enabled

### 7. Dependencies
📦 **Key dependencies to be aware of:**
- `openai==1.54.0` - Must have for OpenAI models
- `anthropic==0.39.0` - Must have for Claude models
- Both installed but need API keys to work

### 8. Prompt Template
📋 **The assessment prompt is in `assessor.py:99-178`**
- Returns JSON structure
- Includes all assessment fields
- Update if adding new fields to response

## Code Quality Checks

### Before Committing

```bash
# 1. Run all tests
tox -e py311

# 2. Check linting
tox -e lint

# 3. Check formatting
tox -e format

# 4. Type checking
tox -e type

# Or run all at once
tox
```

### Code Standards
- **Max line length**: 127 characters
- **Docstrings**: Required for public methods
- **Type hints**: Preferred but not enforced
- **Async functions**: Use `async def` for I/O operations

## Debugging Tips

### Tests Running Slow?
```bash
# Check if mocking is working
export TESTING=true
pytest tests/test_assessor.py -v --durations=5

# Should complete in < 1 second
```

### API Not Responding?
```bash
# Check port
lsof -i :8088

# Check logs
tail -f api_request_log.txt

# Check health endpoint
curl http://localhost:8088/health
```

### LLM Calls Failing?
```bash
# Check API keys
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Check .env file
cat .env | grep API_KEY

# Test with simple request
curl -X POST http://localhost:8088/assess \
  -H "Content-Type: application/json" \
  -d '{"product_name": "Test"}'
```

### Cache Issues?
```bash
# Delete cache database
rm assessment_cache.db

# Restart application (recreates tables)
python main.py
```

## API Response Structure

Example successful response:

```json
{
  "product_name": "Zoom",
  "vendor": {
    "name": "Zoom Video Communications",
    "website": "https://zoom.us",
    "country": "United States",
    "founded": "2011",
    "reputation_summary": "..."
  },
  "category": "Communication",
  "description": "Video conferencing software",
  "usage_description": "Used for virtual meetings and webinars",
  "cve_trends": {
    "total_cves": 10,
    "critical_count": 2,
    "high_count": 3,
    "medium_count": 4,
    "low_count": 1,
    "recent_cves": [...],
    "trend_summary": "..."
  },
  "incidents": [...],
  "compliance": {
    "soc2_compliant": true,
    "iso_certified": true,
    "gdpr_compliant": true,
    "encryption_at_rest": true,
    "encryption_in_transit": true,
    "notes": "..."
  },
  "trust_score": {
    "score": 75,
    "confidence": "Medium",
    "rationale": "...",
    "risk_factors": [...],
    "positive_factors": [...]
  },
  "alternatives": [...],
  "citations": [...],
  "assessment_timestamp": "2025-11-15T12:20:00",
  "cache_key": "abc123..."
}
```

## Quick Reference

### File Locations
- Main app: `src/main.py:146` (port 8088)
- LLM logic: `src/assessor.py:59-97` (assess method)
- Models: `src/models.py:111-183` (AssessmentRequest/Response)
- Test mocks: `tests/conftest.py:86-192`
- Prompt: `src/assessor.py:99-178`

### Key Methods
- `assessor.assess(request, request_id=None)` - Main assessment
- `assessor._call_llm(model, prompt)` - LLM API routing
- `cache_service.get(cache_key)` - Retrieve cached
- `cache_service.set(cache_key, data)` - Store cached
- `logger.log_request()` / `log_response()` - Logging

### Important Constants
- Port: `8088`
- Default model: `gpt-4`
- Temperature: `0.1`
- Cache TTL: `30 days`
- Test count: `79 tests`

## Resources

- **API Documentation**: http://localhost:8088/docs (when running)
- **Testing Guide**: `TESTING.md`
- **Log Format**: `LOG_FORMAT.md`
- **Requirements**: `requirements.txt`
- **Tox Environments**: `tox.ini`

## Version History

- **Current**: LLM-based assessments with OpenAI/Anthropic
- **Previous**: Mock placeholder responses
- **Added**: Request/response logging (2025-11-15)
- **Added**: Automatic test mocking (2025-11-15)

---

**Last Updated**: 2025-11-15

**Maintainer Notes**: This project uses real LLM APIs in production but mocks them in tests for speed. Always run tests before committing. Check `TESTING.md` for detailed testing information.
