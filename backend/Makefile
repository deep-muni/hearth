.PHONY: dev build format format-check lint test check-all

dev:
	APP_ENV=development go run cmd/server/main.go

build:
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/server cmd/server/main.go

format:
	gofmt -s -w .

format-check:
	test -z "$$(gofmt -l .)"

lint:
	go vet ./...
	go run golang.org/x/tools/cmd/deadcode@latest -test ./...

test:
	APP_ENV=test go test -v ./...

check-all: format-check lint test
