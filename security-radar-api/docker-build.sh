#!/bin/bash

# Docker build script for AI Security Assessor

set -e

echo "🐳 Building AI Security Assessor Docker Image"
echo "=============================================="
echo ""

# Parse arguments
BUILD_TYPE="${1:-production}"
TAG="${2:-latest}"

case "$BUILD_TYPE" in
    production|prod)
        echo "📦 Building production image..."
        docker build -t ai-security-assessor:${TAG} .
        echo ""
        echo "✅ Production image built successfully!"
        echo "   Image: ai-security-assessor:${TAG}"
        ;;
    development|dev)
        echo "🔧 Building development image..."
        docker build --target builder -t ai-security-assessor:dev .
        echo ""
        echo "✅ Development image built successfully!"
        echo "   Image: ai-security-assessor:dev"
        ;;
    *)
        echo "Usage: $0 {production|development} [tag]"
        echo ""
        echo "Examples:"
        echo "  $0 production         - Build production image with 'latest' tag"
        echo "  $0 production v1.0.0  - Build production image with 'v1.0.0' tag"
        echo "  $0 development        - Build development image"
        exit 1
        ;;
esac

echo ""
echo "📊 Image details:"
docker images ai-security-assessor:${TAG} --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""
echo "🚀 To run the container:"
if [ "$BUILD_TYPE" = "development" ] || [ "$BUILD_TYPE" = "dev" ]; then
    echo "   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up"
else
    echo "   docker-compose up"
    echo "   or"
    echo "   docker run -p 8088:8088 ai-security-assessor:${TAG}"
fi
