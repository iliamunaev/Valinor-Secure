#!/bin/bash

# Test runner script for AI Security Assessor

echo "🧪 Running AI Security Assessor Tests"
echo "======================================"
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "⚠️  pytest not found. Installing dependencies..."
    pip install -r requirements.txt
fi

# Parse command line arguments
TEST_TYPE="${1:-all}"
COVERAGE="${2:-}"

case "$TEST_TYPE" in
    unit)
        echo "Running unit tests only..."
        pytest tests/test_models.py tests/test_cache_service.py tests/test_assessor.py -v
        ;;
    integration)
        echo "Running integration tests only..."
        pytest tests/test_integration.py -v
        ;;
    api)
        echo "Running API tests only..."
        pytest tests/test_api.py -v
        ;;
    coverage)
        echo "Running all tests with coverage report..."
        pytest tests/ --cov=src --cov-report=html --cov-report=term
        echo ""
        echo "📊 Coverage report generated in htmlcov/index.html"
        ;;
    quick)
        echo "Running quick smoke tests..."
        pytest tests/test_models.py tests/test_cache_service.py -v
        ;;
    all)
        echo "Running all tests..."
        if [ "$COVERAGE" = "coverage" ]; then
            pytest tests/ --cov=src --cov-report=term
        else
            pytest tests/ -v
        fi
        ;;
    *)
        echo "Usage: $0 {unit|integration|api|coverage|quick|all}"
        echo ""
        echo "Examples:"
        echo "  $0 unit         - Run unit tests only"
        echo "  $0 integration  - Run integration tests only"
        echo "  $0 api          - Run API tests only"
        echo "  $0 coverage     - Run all tests with coverage"
        echo "  $0 quick        - Run quick smoke tests"
        echo "  $0 all          - Run all tests (default)"
        exit 1
        ;;
esac

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
