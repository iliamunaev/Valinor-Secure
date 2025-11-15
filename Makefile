COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = valinor
DOCKER_COMPOSE = sudo docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE)

all: build run

build:
	$(DOCKER_COMPOSE) build --parallel

build-no-cache:
	$(DOCKER_COMPOSE) build --parallel --no-cache

run:
	$(DOCKER_COMPOSE) up -d

stop:
	$(DOCKER_COMPOSE) stop

restart: stop run

down:
	$(DOCKER_COMPOSE) down

clean:
	$(DOCKER_COMPOSE) down --rmi all --volumes --remove-orphans || true
	docker network prune -f || true

re: clean all

logs:
	$(DOCKER_COMPOSE) logs -f --tail=200

logs-backend:
	$(DOCKER_COMPOSE) logs -f --tail=100 backend

ps:
	$(DOCKER_COMPOSE) ps

redis-cli:
	$(DOCKER_COMPOSE) exec redis redis-cli

redis-logs:
	$(DOCKER_COMPOSE) logs -f redis

redis-flush:
	$(DOCKER_COMPOSE) exec redis redis-cli FLUSHALL

.PHONY: all build build-no-cache run stop restart down clean re logs logs-backend ps redis-cli redis-logs redis-flush
