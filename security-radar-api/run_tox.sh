#!/bin/bash

# Tox test runner script for AI Security Assessor

echo "🧪 AI Security Assessor - Tox Test Runner"
echo "=========================================="
echo ""

# Check if tox is installed
if ! command -v tox &> /dev/null; then
    echo "⚠️  tox not found. Installing development dependencies..."
    pip install -r requirements-dev.txt
    echo ""
fi

# Parse command line arguments
TEST_ENV="${1:-}"

# Show help if requested
if [ "$TEST_ENV" = "-h" ] || [ "$TEST_ENV" = "--help" ]; then
    echo "Usage: $0 [environment]"
    echo ""
    echo "Available environments:"
    echo "  (none)         - Run tests on default Python version"
    echo "  py311          - Run tests with Python 3.11"
    echo "  py312          - Run tests with Python 3.12"
    echo "  py310          - Run tests with Python 3.10"
    echo "  unit           - Run unit tests only"
    echo "  integration    - Run integration tests only"
    echo "  coverage       - Run tests with coverage report"
    echo "  lint           - Run linting checks"
    echo "  format         - Check code formatting"
    echo "  format-fix     - Apply code formatting"
    echo "  type           - Run type checking"
    echo "  quick          - Run quick smoke tests"
    echo "  clean          - Clean up build artifacts"
    echo "  all            - Run all test environments"
    echo ""
    echo "Examples:"
    echo "  $0              # Run tests on default Python"
    echo "  $0 coverage     # Run with coverage"
    echo "  $0 py311        # Run tests with Python 3.11"
    echo "  $0 lint         # Run linting"
    echo "  $0 all          # Run all environments"
    echo ""
    echo "Pass additional arguments to pytest:"
    echo "  $0 unit -k test_specific_function"
    echo "  $0 coverage --verbose"
    exit 0
fi

# Run tox with the specified environment
if [ -z "$TEST_ENV" ]; then
    echo "Running tests on default Python version..."
    tox "${@:2}"
elif [ "$TEST_ENV" = "all" ]; then
    echo "Running all test environments..."
    tox -p auto "${@:2}"
else
    echo "Running tox environment: $TEST_ENV"
    tox -e "$TEST_ENV" "${@:2}"
fi

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tox tests passed!"
else
    echo "❌ Tox tests failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
