.PHONY: dev dev-frontend dev-backend build-frontend build-backend build format-frontend format-check-frontend lint-frontend test-frontend check-frontend format-backend format-check-backend lint-backend test-unit-backend test-e2e-backend test-backend check-backend format lint test check-all clean run

dev:
	pnpm dev

dev-frontend:
	pnpm --filter frontend dev

dev-backend:
	cd backend && APP_ENV=development go run cmd/server/main.go

build-frontend:
	pnpm --filter frontend build
	rm -rf backend/internal/static/dist/*
	cp -r frontend/out/* backend/internal/static/dist/

build-backend:
	cd backend && CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/server cmd/server/main.go

build: build-frontend build-backend

format-frontend:
	pnpm --filter frontend format

format-check-frontend:
	pnpm --filter frontend format:check

lint-frontend:
	pnpm --filter frontend lint

test-frontend:
	pnpm --filter frontend test

check-frontend:
	pnpm --filter frontend check-all

format-backend:
	cd backend && gofmt -s -w .

format-check-backend:
	cd backend && test -z "$$(gofmt -l .)"

lint-backend:
	cd backend && go vet ./...

test-unit-backend:
	cd backend && APP_ENV=test go test -v ./internal/adapters/storage/... ./internal/config/...

test-e2e-backend:
	cd backend && APP_ENV=test go test -v ./internal/adapters/http/...

test-backend:
	cd backend && APP_ENV=test go test -v ./...

check-backend: format-check-backend lint-backend test-backend

format: format-frontend format-backend

lint: lint-frontend lint-backend

test: test-frontend test-backend

check-all: check-frontend check-backend

clean:
	rm -rf frontend/out frontend/.next backend/bin
