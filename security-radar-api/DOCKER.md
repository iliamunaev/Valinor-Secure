# Docker Deployment Guide

Complete guide for deploying the AI Security Assessor using Docker.

## Table of Contents

- [Quick Start](#quick-start)
- [Docker Files](#docker-files)
- [Building Images](#building-images)
- [Running Containers](#running-containers)
- [Development Mode](#development-mode)
- [Production Deployment](#production-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Access the API
curl http://localhost:8088/health
```

### Using Makefile (Easiest)

```bash
# Show all commands
make help

# Start production service
make up

# Start development service
make dev
```

## Docker Files

The project includes several Docker-related files:

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `.dockerignore` | Excludes unnecessary files from build context |
| `docker-compose.yml` | Production configuration |
| `docker-compose.dev.yml` | Development configuration with hot reload |
| `docker-build.sh` | Helper script for building images |
| `Makefile` | Convenient commands for Docker operations |

## Building Images

### Production Image

```bash
# Using docker directly
docker build -t ai-security-assessor:latest .

# Using build script
./docker-build.sh production

# With custom tag
./docker-build.sh production v1.0.0

# Using Makefile
make build
```

### Development Image

```bash
# Using build script
./docker-build.sh development

# Using Makefile
make build-dev
```

### Multi-Architecture Builds

```bash
# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ai-security-assessor:latest \
  --push .
```

## Running Containers

### Basic Run

```bash
# Run in foreground
docker run -p 8088:8088 ai-security-assessor

# Run in background
docker run -d -p 8088:8088 --name assessor-api ai-security-assessor

# Run with environment variables
docker run -p 8088:8088 \
  -e DEBUG=True \
  -e CACHE_DB_PATH=/app/data/cache.db \
  ai-security-assessor
```

### With Docker Compose

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Using Makefile

```bash
# Production
make up          # Start
make down        # Stop
make restart     # Restart
make logs        # View logs

# Development
make dev         # Start with hot reload
make shell       # Open shell
make test        # Run tests
```

## Development Mode

Development mode enables hot reloading for faster iteration:

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or using Makefile
make dev
```

**Features:**
- Hot reload on code changes
- Debug mode enabled
- Source code mounted as volume
- Development dependencies included

**Directory mounting:**
```yaml
volumes:
  - ./src:/app/src:ro         # Application code
  - ./data:/app/data          # Cache database
  - ./.env:/app/.env:ro       # Environment variables
```

## Production Deployment

### Environment Variables

Set these in production:

```bash
# Required
API_PORT=8088
API_HOST=0.0.0.0

# Optional
APP_NAME=AI Security Assessor
DEBUG=False
CACHE_DB_PATH=/app/data/assessment_cache.db
CACHE_TTL_DAYS=30

# External API Keys (for future features)
NVD_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### Using Docker Compose

**Production configuration:**

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  api:
    image: ai-security-assessor:latest
    restart: always
    ports:
      - "8088:8088"
    environment:
      - DEBUG=False
      - CACHE_DB_PATH=/app/data/cache.db
    volumes:
      - cache_data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8088/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  cache_data:
    driver: local
```

Deploy:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Swarm

```bash
# Initialize swarm (if not already)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml assessor-stack

# List services
docker stack services assessor-stack

# View logs
docker service logs assessor-stack_api

# Scale service
docker service scale assessor-stack_api=3

# Remove stack
docker stack rm assessor-stack
```

### Kubernetes

```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml

# Apply to cluster
kubectl apply -f .

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/api

# Scale deployment
kubectl scale deployment api --replicas=3
```

## Configuration

### Volume Mounts

**Cache persistence:**
```bash
docker run -p 8088:8088 \
  -v $(pwd)/data:/app/data \
  ai-security-assessor
```

**Custom configuration:**
```bash
docker run -p 8088:8088 \
  -v $(pwd)/.env:/app/.env:ro \
  -v $(pwd)/custom_config.py:/app/src/config.py:ro \
  ai-security-assessor
```

### Networking

**Bridge network (default):**
```bash
docker network create assessor-network
docker run --network assessor-network -p 8088:8088 ai-security-assessor
```

**Host network:**
```bash
docker run --network host ai-security-assessor
```

**Custom ports:**
```bash
docker run -p 9000:8088 ai-security-assessor
# Access at http://localhost:9000
```

### Resource Limits

```bash
# Limit memory and CPU
docker run -p 8088:8088 \
  --memory="512m" \
  --cpus="1.0" \
  ai-security-assessor
```

**In docker-compose.yml:**
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

### Health Checks

```bash
# Check container health
docker ps
docker inspect assessor-api | grep -A 10 Health

# Manual health check
curl http://localhost:8088/health

# Using Makefile
make health
```

### Logs

```bash
# View logs
docker-compose logs api

# Follow logs
docker-compose logs -f api

# Last 100 lines
docker-compose logs --tail=100 api

# Using Makefile
make logs
make logs-tail
```

### Resource Usage

```bash
# Monitor resources
docker stats assessor-api

# Using Makefile
make stats
```

## Troubleshooting

### Common Issues

#### Container exits immediately

```bash
# Check logs
docker-compose logs api

# Run with interactive shell
docker run -it ai-security-assessor /bin/bash

# Check process
docker-compose exec api ps aux
```

#### Port already in use

```bash
# Check what's using the port
lsof -i :8088
netstat -tulpn | grep 8088

# Use different port
docker run -p 9000:8088 ai-security-assessor
```

#### Permission denied errors

```bash
# Ensure volumes have correct permissions
chown -R 1000:1000 ./data

# Run with correct user
docker run --user 1000:1000 -p 8088:8088 ai-security-assessor
```

#### Cache not persisting

```bash
# Check volume
docker volume ls
docker volume inspect assesor-llm_cache_data

# Verify mount
docker-compose exec api ls -la /app/data

# Manual backup
docker run --rm \
  -v assesor-llm_cache_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/cache-backup.tar.gz -C /data .
```

#### Container can't connect to network

```bash
# Check network
docker network ls
docker network inspect assesor-llm_assessor-network

# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
docker run -p 8088:8088 -e DEBUG=True ai-security-assessor

# Or in docker-compose.yml
environment:
  - DEBUG=True
```

### Shell Access

```bash
# Access running container
docker-compose exec api /bin/bash

# Or using Makefile
make shell

# Start new container with shell
docker run -it ai-security-assessor /bin/bash
```

### Inspect Configuration

```bash
# View environment variables
docker-compose exec api env

# Or using Makefile
make inspect

# Check Python version
docker-compose exec api python --version

# Check installed packages
docker-compose exec api pip list
```

## Best Practices

### Security

1. **Run as non-root user** (already configured)
2. **Use secrets for sensitive data:**
   ```bash
   docker secret create api_key /path/to/key
   ```
3. **Keep base image updated:**
   ```bash
   docker pull python:3.11-slim
   docker build --no-cache -t ai-security-assessor .
   ```
4. **Scan for vulnerabilities:**
   ```bash
   docker scan ai-security-assessor
   ```

### Performance

1. **Use multi-stage builds** (already configured)
2. **Optimize layer caching:**
   - Copy requirements.txt first
   - Install dependencies before copying code
3. **Use .dockerignore** (already configured)
4. **Minimize image size:**
   ```bash
   docker images ai-security-assessor --format "{{.Size}}"
   ```

### Maintenance

1. **Regular updates:**
   ```bash
   make build
   make down
   make up
   ```
2. **Clean unused resources:**
   ```bash
   make clean
   make prune
   ```
3. **Backup data:**
   ```bash
   docker run --rm \
     -v assesor-llm_cache_data:/data \
     -v $(pwd):/backup \
     alpine tar czf /backup/cache-$(date +%Y%m%d).tar.gz -C /data .
   ```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
