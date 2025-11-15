COMPOSE_FILE = docker-compose.yml
PROJECT_NAME = valinor
DOCKER_COMPOSE = sudo docker compose -p $(PROJECT_NAME) -f $(COMPOSE_FILE)

all: build run

build:
	$(DOCKER_COMPOSE) build --parallel

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

ps:
	$(DOCKER_COMPOSE) ps

.PHONY: all build run stop restart down clean re logs ps
