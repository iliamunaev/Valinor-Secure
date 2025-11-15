# Nginx Proxy

This directory contains the nginx reverse proxy configuration for the Valinor Secure application.

## Overview

The nginx proxy acts as a reverse proxy and load balancer for the entire application stack, routing requests to the appropriate backend services:

- **Frontend** (`/`) - Routes to the React frontend (port 5173)
- **Backend API** (`/api/`) - Routes to the Python backend (port 8000)  
- **Security Radar API** (`/security-api/`) - Routes to the security assessment service (port 8088)

## Features

- **Reverse Proxy**: Routes requests to appropriate backend services
- **CORS Handling**: Proper CORS headers for API endpoints
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Gzip Compression**: Automatic compression for better performance
- **Static File Caching**: Optimized caching for frontend assets
- **Health Checks**: Built-in health check endpoint at `/health`

## Configuration

### nginx.conf
The main nginx configuration file that defines:
- Upstream server definitions
- Proxy settings
- Security headers
- Caching rules
- CORS policies

### Dockerfile
Creates a lightweight nginx container based on Alpine Linux with:
- Custom nginx configuration
- Proper user permissions
- Health check endpoint
- Optimized for production use

## Usage

The nginx proxy is automatically started when you run:

```bash
docker-compose up
```

### Endpoints

Once running, you can access:

- **Application**: http://localhost (port 80)
- **Backend API**: http://localhost/api/
- **Security API**: http://localhost/security-api/
- **Health Check**: http://localhost/health

### Development

For development, the proxy forwards WebSocket connections to support hot reloading and development tools.

## Security

The proxy includes several security measures:
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Hidden file access denial
- CORS configuration for API endpoints
- Server tokens disabled

## Monitoring

- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
- Health check: `/health` endpoint