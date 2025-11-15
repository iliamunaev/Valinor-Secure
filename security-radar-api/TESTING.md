# Testing Guide

This document explains how testing is configured to run fast without making real API calls.

## Overview

The test suite uses **automatic mocking** to replace real LLM API calls with instant mock responses. This ensures:

- ✓ **Fast execution** (< 1 second instead of minutes)
- ✓ **No API costs** during testing
- ✓ **Consistent results** (no dependency on external services)
- ✓ **Works in CI/CD** (no API keys required)

## How It Works

### Automatic Mocking

When running tests (pytest or tox), LLM API calls are automatically mocked:

1. **Environment Detection**: Tests set `TESTING=true` and `ENABLE_REQUEST_LOGGING=false`
2. **Automatic Patching**: The `conftest.py` fixture automatically patches `SecurityAssessor._call_llm()`
3. **Mock Response**: Returns a realistic JSON response instantly (no network call)

### Configuration Files

**`tests/conftest.py`:**
- Sets `TESTING=true` environment variable
- Defines `mock_llm_response` fixture with realistic test data
- Defines `mock_assessor_llm` fixture (autouse=True) that patches all tests

**`pytest.ini`:**
```ini
[pytest:env]
TESTING = true
ENABLE_REQUEST_LOGGING = false
```

**`tox.ini`:**
```ini
[testenv]
setenv =
    TESTING = true
    ENABLE_REQUEST_LOGGING = false
    OPENAI_API_KEY = mock-key-for-testing
    ANTHROPIC_API_KEY = mock-key-for-testing
```

## Running Tests

### Quick Test Run

```bash
# Run all tests (fast, using mocks)
pytest tests/ -v

# Run specific test file
pytest tests/test_assessor.py -v

# Run with coverage
pytest tests/ --cov=src --cov-report=term-missing
```

**Expected output:**
```
79 passed, 4 warnings in 0.82s
```

### Using Tox

```bash
# Run tests with tox (Python 3.11)
tox -e py311

# Run quick smoke tests
tox -e quick

# Run unit tests only
tox -e unit

# Run integration tests only
tox -e integration

# Run with coverage report
tox -e coverage
```

**Expected output:**
```
27 passed, 3 warnings in 0.46s
py311: OK (1.76=setup[0.01]+cmd[1.75] seconds)
congratulations :) (1.83 seconds)
```

## Mock Response Data

The mock LLM response is defined in `tests/conftest.py` and includes:

- Vendor information (name, website, country, founded, reputation)
- Software category classification
- CVE trends (5 total CVEs: 1 critical, 2 high, 2 medium)
- Security incidents
- Compliance info (SOC2, ISO, GDPR, encryption)
- Trust score (75/100, Medium confidence)
- Alternative suggestions
- Citations

This realistic mock data ensures that:
- JSON parsing logic is tested
- Response validation works correctly
- All model fields are properly mapped
- Error handling paths can be tested

## Test Coverage

Current test coverage:

```
tests/test_api.py .............. (16 tests) - API endpoint tests
tests/test_assessor.py ......... (27 tests) - Core assessor logic
tests/test_cache_service.py .... (13 tests) - Cache operations
tests/test_integration.py ...... (10 tests) - End-to-end workflows
tests/test_models.py ........... (13 tests) - Data model validation

Total: 79 tests
```

## Real API Testing

To test with **real API calls** (for manual verification):

```bash
# Temporarily disable mocking
export TESTING=false
export ENABLE_REQUEST_LOGGING=true

# Run a single test
pytest tests/test_assessor.py::TestSecurityAssessor::test_assess_basic -v -s

# This will make real API calls and may take 10-30 seconds
```

**Note:** Real API calls require valid API keys in `.env`:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## Continuous Integration

In CI/CD pipelines (GitHub Actions, GitLab CI, etc.):

1. No API keys required
2. Tests run automatically with mocks
3. Fast execution (< 10 seconds total)
4. No external dependencies

Example GitHub Actions workflow:
```yaml
- name: Run tests
  run: |
    pip install tox
    tox -e py311
  env:
    TESTING: true
```

## Adding New Tests

When writing new tests that call `assessor.assess()`:

1. **No special setup needed** - mocking is automatic
2. **Use mock data expectations** - vendor name will be "Test Vendor", score will be 75, etc.
3. **Test structure, not content** - verify fields exist and have correct types

Example:
```python
@pytest.mark.asyncio
async def test_my_new_feature(assessor, sample_request):
    result = await assessor.assess(sample_request)

    # Mock returns trust_score=75
    assert result.trust_score.score == 75

    # Mock returns vendor="Test Vendor"
    assert result.vendor.name is not None

    # Test your specific logic
    assert result.product_name == sample_request.product_name
```

## Performance Benchmarks

| Test Suite | Mock Mode | Real API Mode |
|------------|-----------|---------------|
| test_assessor.py | 0.46s | ~60s |
| Full suite (79 tests) | 0.82s | ~10min |
| tox py311 | 1.76s | ~12min |

**Speedup: ~600x faster with mocks!**

## Troubleshooting

### Tests making real API calls

If tests are slow or failing with API errors:

1. Check environment variables:
   ```bash
   echo $TESTING  # Should be "true"
   ```

2. Verify conftest.py has `autouse=True`:
   ```python
   @pytest.fixture(autouse=True)
   def mock_assessor_llm(monkeypatch, mock_llm_call):
   ```

3. Check for test isolation issues:
   ```bash
   pytest tests/test_assessor.py -v -s  # Shows print statements
   ```

### Mock not applied

If the mock isn't working:

1. Restart your test session
2. Clear pytest cache: `rm -rf .pytest_cache`
3. Check import order in conftest.py
4. Verify the patch target: `"src.assessor.SecurityAssessor._call_llm"`

### Updating Mock Data

To change the mock response, edit `tests/conftest.py`:

```python
@pytest.fixture
def mock_llm_response():
    """Create a mock LLM response that matches the expected format."""
    return json.dumps({
        "vendor": {
            "name": "Your Test Vendor",
            # ... customize as needed
        },
        # ...
    })
```

## Best Practices

1. ✓ Always run tests before committing
2. ✓ Use `pytest -v` for detailed output
3. ✓ Run `tox` before pushing to ensure all Python versions work
4. ✓ Add `--tb=short` for concise error output
5. ✓ Use `--cov` to maintain high test coverage
6. ✓ Test real APIs manually before major releases
7. ✓ Keep mock data realistic and up-to-date
