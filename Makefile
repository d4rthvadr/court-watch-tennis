.PHONY: help up down prune dev-backend dev-client

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services in detached mode
	docker-compose up -d --build

down: ## Stop and remove all containers
	docker-compose down

prune: ## Remove all unused containers, networks, images and volumes
	docker system prune -af --volumes
	docker-compose down -v --remove-orphans

dev-backend: ## Start only backend service
	docker-compose up -d --build backend

dev-client: ## Start only client service
	docker-compose up -d --build client
