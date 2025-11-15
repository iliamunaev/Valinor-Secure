# Tox Testing Guide

Comprehensive guide for testing the AI Security Assessor using Tox.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Available Environments](#available-environments)
- [Usage Examples](#usage-examples)
- [Advanced Usage](#advanced-usage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Introduction

Tox is a test automation tool that allows you to:
- Test across multiple Python versions (3.10, 3.11, 3.12)
- Run different test suites (unit, integration, coverage)
- Perform code quality checks (linting, formatting, type checking)
- Maintain isolated test environments

## Installation

### Install Development Dependencies

```bash
# Install all development dependencies (recommended)
pip install -r requirements-dev.txt

# Or install just tox
pip install tox
```

### Verify Installation

```bash
tox --version
# Output: 4.11.0 or higher
```

## Quick Start

```bash
# Run tests on default Python version
tox

# Run quick smoke tests
tox -e quick

# Run with coverage
tox -e coverage

# Run all environments in parallel
tox -p auto
```

## Available Environments

### Test Environments

| Environment | Description | Command |
|-------------|-------------|---------|
| `py311` | Run tests with Python 3.11 | `tox -e py311` |
| `py312` | Run tests with Python 3.12 | `tox -e py312` |
| `py310` | Run tests with Python 3.10 | `tox -e py310` |
| `unit` | Run unit tests only | `tox -e unit` |
| `integration` | Run integration tests only | `tox -e integration` |
| `coverage` | Run tests with coverage report | `tox -e coverage` |
| `quick` | Run quick smoke tests | `tox -e quick` |

### Code Quality Environments

| Environment | Description | Command |
|-------------|-------------|---------|
| `lint` | Run flake8 linting (critical errors) | `tox -e lint` |
| `lint-strict` | Run strict linting (including docstrings) | `tox -e lint-strict` |
| `format` | Check code formatting with black | `tox -e format` |
| `format-fix` | Auto-format code with black | `tox -e format-fix` |
| `type` | Run type checking with mypy | `tox -e type` |

### Utility Environments

| Environment | Description | Command |
|-------------|-------------|---------|
| `clean` | Clean up build artifacts | `tox -e clean` |
| `dev` | Setup development environment | `tox -e dev` |
| `docs` | Check documentation | `tox -e docs` |

## Usage Examples

### Basic Testing

```bash
# Run all tests on current Python version
tox

# Run tests on specific Python version
tox -e py311

# Run multiple environments sequentially
tox -e py311,py312,lint

# Run multiple environments in parallel
tox -e py311,py312,lint -p auto
```

### Targeted Testing

```bash
# Run only unit tests
tox -e unit

# Run only integration tests
tox -e integration

# Run quick smoke tests
tox -e quick
```

### Coverage Analysis

```bash
# Generate coverage report
tox -e coverage

# View coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

### Code Quality Checks

```bash
# Run linting
tox -e lint

# Run strict linting
tox -e lint-strict

# Check code formatting
tox -e format

# Auto-format code
tox -e format-fix

# Type checking
tox -e type

# Run all quality checks
tox -e lint,format,type
```

### Using the Tox Runner Script

```bash
# Show help
./run_tox.sh --help

# Run default tests
./run_tox.sh

# Run specific environment
./run_tox.sh coverage

# Run all environments in parallel
./run_tox.sh all

# Pass arguments to pytest
./run_tox.sh unit -- -v -k test_specific_function
```

## Advanced Usage

### Passing Arguments to Pytest

Use `--` to pass arguments to pytest:

```bash
# Run specific test
tox -e unit -- tests/test_models.py::TestTrustScore

# Run with verbose output
tox -e unit -- -v

# Run tests matching pattern
tox -e unit -- -k test_cache

# Run with custom markers
tox -e unit -- -m "not slow"

# Multiple arguments
tox -e coverage -- -v --tb=short -k test_api
```

### Recreating Environments

Force recreation of virtual environments:

```bash
# Recreate specific environment
tox -e py311 --recreate

# Recreate all environments
tox --recreate
```

### Skip Missing Interpreters

Continue even if Python version not available:

```bash
# This will skip py312 if Python 3.12 not installed
tox -e py310,py311,py312 --skip-missing-interpreters
```

### Parallel Execution

Run multiple environments simultaneously:

```bash
# Auto-detect number of parallel processes
tox -p auto

# Specify number of parallel processes
tox -p 4 -e py310,py311,py312,lint

# Show output in real-time
tox -p auto --parallel-live
```

### Environment Variables

Set environment variables for tests:

```bash
# Set single variable
TOX_TESTENV_PASSENV=DEBUG tox -e unit

# Set multiple variables
DEBUG=True VERBOSE=1 tox -e unit
```

### List Environments

```bash
# List all available environments
tox -l

# Show detailed environment info
tox -av
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.10', '3.11', '3.12']

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}

    - name: Install dependencies
      run: |
        pip install tox tox-gh-actions

    - name: Run tests
      run: |
        tox

  quality:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: pip install tox

    - name: Run quality checks
      run: tox -e lint,format,type
```

### GitLab CI

```yaml
stages:
  - test
  - quality

test:
  stage: test
  image: python:3.11
  parallel:
    matrix:
      - PYTHON_VERSION: ['3.10', '3.11', '3.12']
  script:
    - pip install tox
    - tox -e py${PYTHON_VERSION//./}

quality:
  stage: quality
  image: python:3.11
  script:
    - pip install tox
    - tox -e lint,format,type
```

### Jenkins

```groovy
pipeline {
    agent any

    stages {
        stage('Test') {
            parallel {
                stage('Python 3.11') {
                    steps {
                        sh 'tox -e py311'
                    }
                }
                stage('Python 3.12') {
                    steps {
                        sh 'tox -e py312'
                    }
                }
            }
        }

        stage('Quality') {
            steps {
                sh 'tox -e lint,format,type'
            }
        }

        stage('Coverage') {
            steps {
                sh 'tox -e coverage'
                publishHTML(target: [
                    reportDir: 'htmlcov',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
    }
}
```

## Troubleshooting

### Common Issues

#### Python Version Not Found

```
ERROR: InterpreterNotFound: python3.12
```

**Solution:**
- Install the required Python version
- Or skip missing interpreters: `tox --skip-missing-interpreters`

#### Environment Already Exists

```
ERROR: environment exists and is not outdated
```

**Solution:**
```bash
# Recreate environment
tox -e py311 --recreate

# Clean all environments
tox -e clean
rm -rf .tox
```

#### Import Errors

```
ModuleNotFoundError: No module named 'src'
```

**Solution:**
```bash
# Ensure package is installed in tox environment
tox -e py311 --recreate

# Check deps in tox.ini includes -rrequirements.txt
```

#### Tests Pass Locally But Fail in Tox

**Common causes:**
1. Environment variables not set
2. Different dependencies versions
3. Missing test data files

**Solution:**
```bash
# Check what's different
tox -e py311 -- --verbose

# Run with environment variables
DEBUG=True tox -e py311

# Recreate environment
tox -e py311 --recreate
```

### Debugging

```bash
# Run with verbose output
tox -v

# Show commands being executed
tox -vv

# Show all output
tox -vvv

# Run interactive shell in tox environment
tox -e py311 --notest
source .tox/py311/bin/activate
python
```

### Performance Issues

```bash
# Use parallel execution
tox -p auto

# Skip slow tests
tox -e unit -- -m "not slow"

# Use faster test runner
tox -e quick
```

## Best Practices

### Pre-Commit Checks

Run before committing:

```bash
# Quick quality check
tox -e lint,format,quick

# Full check
tox -e lint,format,type,unit
```

### Development Workflow

```bash
# 1. Make changes
vim src/models.py

# 2. Run quick tests
./run_tox.sh quick

# 3. Run full tests
./run_tox.sh coverage

# 4. Check code quality
./run_tox.sh lint

# 5. Fix formatting
./run_tox.sh format-fix

# 6. Commit
git commit -am "Add new feature"
```

### Release Workflow

```bash
# Run complete test suite
tox -e py310,py311,py312,coverage,lint,format,type

# Or use parallel execution
tox -p auto

# Check coverage report
open htmlcov/index.html

# If all pass, proceed with release
```

## Additional Resources

- [Tox Documentation](https://tox.wiki/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Coverage.py Documentation](https://coverage.readthedocs.io/)
- [Flake8 Documentation](https://flake8.pycqa.org/)
- [Black Documentation](https://black.readthedocs.io/)
- [Mypy Documentation](https://mypy.readthedocs.io/)
