FROM node:20-alpine AS dev
WORKDIR /app

# Simple dev starter: install deps if missing, then run Vite
RUN cat <<'EOF' >/usr/local/bin/start-dev && \
    chmod +x /usr/local/bin/start-dev
#!/bin/sh
set -e
if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  if [ -f package-lock.json ]; then
    npm ci --no-audit --no-fund
  else
    npm install --no-audit --no-fund
  fi
fi
exec npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
EOF

EXPOSE 5173

CMD ["start-dev"]

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    else \
      npm install --no-audit --no-fund; \
    fi

COPY . .

RUN npm run build

FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
