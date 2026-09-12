.PHONY: dev dev-frontend dev-backend build-frontend build-backend build format-frontend format-check-frontend lint-frontend test-frontend check-frontend format-backend format-check-backend lint-backend test-backend check-backend format lint test check-all clean

dev:
	pnpm dev

dev-frontend:
	pnpm --filter frontend dev

dev-backend:
	$(MAKE) -C backend dev

build-frontend:
	pnpm --filter frontend build
	rm -rf backend/internal/static/dist/*
	cp -r frontend/out/* backend/internal/static/dist/

build-backend:
	$(MAKE) -C backend build

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
	$(MAKE) -C backend format

format-check-backend:
	$(MAKE) -C backend format-check

lint-backend:
	$(MAKE) -C backend lint

test-backend:
	$(MAKE) -C backend test

check-backend:
	$(MAKE) -C backend check-all

format: format-frontend format-backend

lint: lint-frontend lint-backend

test: test-frontend test-backend

check-all: check-frontend check-backend

clean:
	rm -rf frontend/out frontend/.next backend/bin
