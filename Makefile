.PHONY: dev-frontend dev-backend build-frontend build-backend build test-frontend test-backend test check-all clean run

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

test-frontend:
	pnpm --filter frontend check-all

test-backend:
	cd backend && APP_ENV=test go test ./...

test: test-frontend test-backend

check-all: test

clean:
	rm -rf frontend/out frontend/.next backend/bin
