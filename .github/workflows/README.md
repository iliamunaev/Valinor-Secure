# GitHub Actions Workflows

This directory contains CI/CD workflows for the Security Radar API.

## Workflows

### tests.yml
Main test workflow that runs on every push and pull request.

**What it does:**
- Runs tests on Python 3.11 and 3.12
- Runs linting checks (flake8)
- Runs code formatting checks (black)
- Runs type checking (mypy)
- Uploads coverage reports

**Configuration:**
- Uses `tox-gh-actions` to automatically map Python versions
- Sets `TESTING=true` to ensure mock LLM responses
- Sets `ENABLE_REQUEST_LOGGING=false` to disable logging

**Expected runtime:**
- Tests: ~30-45 seconds per Python version
- Lint: ~10 seconds
- Type check: ~15 seconds
- Total: ~2-3 minutes

## Local Testing

Before pushing, run the same checks locally:

```bash
# Run all tests
tox

# Run specific Python version
tox -e py310

# Run linting
tox -e lint

# Run formatting check
tox -e format

# Run type checking
tox -e type
```

## Troubleshooting

### Tests failing in CI but passing locally

1. Check Python version consistency
2. Verify `TESTING=true` is set
3. Check dependency versions match
4. Clear tox cache: `tox -r`

### Slow tests in CI

Tests should complete in < 1 second per test file with mocking enabled.
If tests are slow:
- Verify `TESTING=true` is set in environment
- Check conftest.py has `autouse=True` on mock fixture
- Verify no real API keys are being used

### Coverage upload failures

Coverage upload is configured to not fail the build (`fail_ci_if_error: false`).
This is intentional to prevent flaky codecov uploads from blocking PRs.

## Adding New Checks

To add a new check to the workflow:

1. Add the check to `tox.ini` as a new environment
2. Add a step to `.github/workflows/tests.yml`
3. Test locally with `tox -e <env-name>`
4. Commit and push to see it run in CI
