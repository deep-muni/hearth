# Stage 1: Build Frontend Static Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
RUN pnpm install --frozen-lockfile
COPY frontend ./frontend
RUN cd frontend && pnpm run build

# Stage 2: Build Go Binary with Embedded UI
FROM golang:1.25-alpine AS backend-builder
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/out ./backend/internal/static/dist
RUN cd backend && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/househelp cmd/server/main.go

# Stage 3: Minimal Scratch/Alpine Production Image (<25MB)
FROM alpine:3.20
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=backend-builder /app/househelp .
EXPOSE 8080
ENV PORT=8080 \
    APP_ENV=production
CMD ["./househelp"]
