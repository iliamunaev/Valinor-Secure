.PHONY: help build build-dev up up-dev down logs clean test shell

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "AI Security Assessor - Docker Commands"
	@echo "======================================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build production Docker image
	@echo "🐳 Building production image..."
	docker build -t ai-security-assessor:latest .

build-dev: ## Build development Docker image
	@echo "🔧 Building development image..."
	docker build --target builder -t ai-security-assessor:dev .

up: ## Start production containers
	@echo "🚀 Starting production containers..."
	docker-compose up -d
	@echo "✅ Service running at http://localhost:8088"
	@echo "📚 API docs at http://localhost:8088/docs"

up-dev: ## Start development containers with hot reload
	@echo "🔧 Starting development containers..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
	@echo "✅ Development service running at http://localhost:8088"

down: ## Stop and remove containers
	@echo "🛑 Stopping containers..."
	docker-compose down

logs: ## View container logs
	docker-compose logs -f api

logs-tail: ## Tail last 100 lines of logs
	docker-compose logs --tail=100 api

restart: ## Restart containers
	@echo "🔄 Restarting containers..."
	docker-compose restart

ps: ## Show running containers
	docker-compose ps

shell: ## Open shell in running container
	docker-compose exec api /bin/bash

test: ## Run tests in container
	docker-compose exec api pytest tests/ -v

test-coverage: ## Run tests with coverage in container
	docker-compose exec api pytest tests/ --cov=src --cov-report=term

clean: ## Remove containers, volumes, and images
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker rmi ai-security-assessor:latest ai-security-assessor:dev 2>/dev/null || true
	@echo "✅ Cleanup complete"

prune: ## Prune all unused Docker resources
	@echo "🧹 Pruning unused Docker resources..."
	docker system prune -a --volumes -f

stats: ## Show container resource usage
	docker stats assessor-api --no-stream

inspect: ## Inspect container configuration
	docker-compose exec api env

health: ## Check container health
	@curl -s http://localhost:8088/health | python -m json.tool

# Development workflow
dev: build-dev up-dev ## Build and start development environment

# Production workflow
prod: build up ## Build and start production environment

# Quick test workflow
quick-test: up ## Start service and run quick test
	@sleep 5
	@echo "🧪 Running health check..."
	@curl -s http://localhost:8088/health
	@echo ""
	@echo "🧪 Running assessment test..."
	@curl -s -X POST http://localhost:8088/assess \
		-H "Content-Type: application/json" \
		-d '{"product_name":"FileZilla"}' | python -m json.tool | head -20
