FROM node:20-alpine AS dev
WORKDIR /app

COPY start-dev.sh /usr/local/bin/start-dev
RUN chmod +x /usr/local/bin/start-dev

EXPOSE 5173
CMD ["start-dev"]