.PHONY: dev build dev-frontend dev-backend build-frontend build-backend test lint

dev:
	pnpm --filter frontend dev

build:
	pnpm --filter frontend build
	cd backend && go build -o bin/server cmd/server/main.go

dev-frontend:
	pnpm --filter frontend dev

build-frontend:
	pnpm --filter frontend build

dev-backend:
	cd backend && go run cmd/server/main.go

build-backend:
	cd backend && go build -o bin/server cmd/server/main.go

lint:
	pnpm --filter frontend lint
