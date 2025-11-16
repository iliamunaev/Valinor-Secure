# Use Node.js 18 Alpine as base image for smaller size
FROM node:20-alpine as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Development stage
FROM base as dev
COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host"]

# Build stage
FROM base as builder
COPY . .
RUN pnpm run build

# Production stage
FROM nginx:alpine as production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
