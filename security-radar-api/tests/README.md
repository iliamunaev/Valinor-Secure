# Test Suite Documentation

This directory contains the comprehensive test suite for the AI Security Assessor service.

## Overview

The test suite includes **79+ tests** organized into the following categories:

### Test Files

#### 1. `test_models.py` (13 tests)
Tests for Pydantic data models and validation.

**Coverage:**
- `AssessmentRequest` - Request validation
- `VendorInfo` - Vendor information structure
- `TrustScore` - Score validation (0-100 range)
- `CVETrend` - CVE statistics and trends
- `ComplianceInfo` - Compliance data structure
- `CitationSource` - Source citations
- `SoftwareCategory` - Software classification enum
- `AssessmentResponse` - Complete response structure

**Key Tests:**
- Field validation
- Required vs optional fields
- Default values
- Range constraints
- Enum values

#### 2. `test_cache_service.py` (13 tests)
Tests for SQLite-based caching functionality.

**Coverage:**
- Cache initialization
- Key generation and normalization
- Data storage and retrieval
- Cache metadata
- Access tracking
- Pagination
- Search functionality
- Statistics
- Old entry cleanup

**Key Tests:**
- Deterministic cache key generation
- Case-insensitive normalization
- Cache hit/miss scenarios
- Access count tracking
- Search by product name
- Pagination edge cases

#### 3. `test_assessor.py` (27 tests)
Tests for core assessment logic and software classification.

**Coverage:**
- Assessment workflow
- Software classification (16+ categories)
- Trust score calculation
- Cache key generation
- Multi-product assessment

**Software Categories Tested:**
- Password Manager
- Compression Utility
- File Sharing
- Remote Access
- Communication
- Development Tool
- Security Tool
- Virtualization
- Office Suite
- Gaming
- Backup/Storage
- Browser
- Other/Unknown

**Trust Score Tests:**
- Baseline calculation
- CVE impact
- Critical CVE penalties
- Incident impact
- Compliance bonuses
- Boundary conditions (0-100)

#### 4. `test_api.py` (16 tests)
Tests for FastAPI endpoints and HTTP interfaces.

**Coverage:**
- Root endpoint (`/`)
- Health check (`/health`)
- Assessment endpoint (`POST /assess`)
- Cache retrieval (`GET /cache/{key}`)
- Cache listing (`GET /cache`)
- File upload (`POST /assess/file`)
- Error handling
- CORS middleware

**Key Tests:**
- Request/response validation
- Error status codes (422, 404, 405)
- Pagination parameters
- Cache integration
- Multiple product assessment

#### 5. `test_integration.py` (10 tests)
End-to-end integration tests for complete workflows.

**Coverage:**
- Complete assessment workflow
- Multi-product assessment
- Cache persistence across instances
- API assess-and-retrieve workflow
- Force refresh functionality
- Error recovery
- Cache search integration

**Key Tests:**
- Full workflow from request to cached response
- Multiple products with caching
- Cache hit scenarios
- API end-to-end flows
- Error handling and recovery

## Running Tests

### Quick Start

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_models.py

# Run specific test class
pytest tests/test_api.py::TestAssessEndpoint

# Run specific test
pytest tests/test_models.py::TestTrustScore::test_score_range_validation
```

### Using the Test Runner

```bash
# Run all tests
./run_tests.sh

# Run unit tests only
./run_tests.sh unit

# Run integration tests only
./run_tests.sh integration

# Run API tests only
./run_tests.sh api

# Run with coverage report
./run_tests.sh coverage

# Run quick smoke tests
./run_tests.sh quick
```

### Coverage Reports

```bash
# Generate HTML coverage report
pytest --cov=src --cov-report=html

# View in browser
open htmlcov/index.html

# Terminal coverage report
pytest --cov=src --cov-report=term
```

## Test Fixtures

The `conftest.py` file provides shared fixtures:

- `client` - FastAPI TestClient for API testing
- `temp_cache_db` - Temporary database for testing
- `cache_service` - Initialized cache service instance
- `assessor` - Security assessor instance
- `sample_request` - Single assessment request
- `sample_requests` - Multiple assessment requests

## Test Configuration

Configuration is managed in `pytest.ini`:

- **Test discovery**: `test_*.py` files
- **Markers**: `unit`, `integration`, `slow`, `asyncio`
- **Coverage**: Source in `src/`, omit test files
- **Output**: Verbose with short traceback

## Writing New Tests

### Unit Test Template

```python
"""Tests for new module"""

import pytest
from src.new_module import NewClass


class TestNewClass:
    """Tests for NewClass."""

    def test_basic_functionality(self):
        """Test basic functionality."""
        obj = NewClass()
        assert obj.method() == expected_result
```

### Async Test Template

```python
@pytest.mark.asyncio
async def test_async_method(self, assessor):
    """Test async method."""
    result = await assessor.async_method()
    assert result is not None
```

### API Test Template

```python
def test_api_endpoint(self, client):
    """Test API endpoint."""
    response = client.get("/endpoint")
    assert response.status_code == 200
    assert "key" in response.json()
```

## CI/CD Integration

The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    pip install -r requirements.txt
    pytest tests/ --cov=src --cov-report=xml
```

## Test Maintenance

### Adding Tests
- Follow existing naming conventions
- Use appropriate fixtures from `conftest.py`
- Add docstrings explaining what is tested
- Group related tests in classes

### Coverage Goals
- Aim for >80% code coverage
- Focus on critical paths first
- Test edge cases and error conditions
- Include both positive and negative tests

### Performance
- Unit tests should run in <0.1s each
- Integration tests should run in <1s each
- Use `pytest.mark.slow` for slower tests
- Mock external dependencies when possible

## Troubleshooting

### Common Issues

**Import errors:**
```bash
# Ensure src is in Python path
export PYTHONPATH="${PYTHONPATH}:."
```

**Database conflicts:**
```bash
# Clean up test databases
rm -f test_*.db
```

**Fixture not found:**
- Check `conftest.py` imports
- Verify fixture scope
- Ensure pytest is discovering the file

**Async tests not running:**
```bash
# Install pytest-asyncio
pip install pytest-asyncio
```

## Additional Resources

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
