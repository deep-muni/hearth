# 🏡 Hearth: Household Workspace & Management Platform

A unified, modular household workspace application featuring **Staff & Budget Management** and **Weekly Meal Planning**. Built with Next.js 16, React 19, Go 1.25, and MongoDB persistence.

---

## 📦 Modular Workspaces

1. **👥 Staff & Budget Workspace** (`/staff-budget`):
   - Multi-staff monthly calendar with status tracking (**Present**, **Leave**, **Paid Leave**, **Weekly Off**).
   - Real-time salary calculations across multiple models (Daily rate with paid leave allowance, Fixed salary, Item count logging).
   - Adjustments (Bonus/Tips, Advance deductions), payment receipt generation, and MongoDB cloud persistence.

2. **🍲 Meal Planner Workspace** (`/meal-planner`):
   - Accordion week planner with automatic baseline routine fallback.
   - Intelligent dish library with frequency rankings and autocomplete comboboxes.
   - WhatsApp-formatted export previews for household cooks.
   - Custom meal time slots manager and baseline weekly routine setup.

3. **🏢 Workspaces Hub** (`/`):
   - Fast module switcher and quick-access dashboard.

---

## 🗄️ Database & Environment Configuration

Hearth cleanly separates databases across **3 environments** (**local**, **development**, and **production**) using the `hearth-` database naming convention:

| `APP_ENV` Value | Default `MONGODB_DATABASE` | Use Case |
|---|---|---|
| `local` (default) | `hearth-local` | Local machine running with local MongoDB |
| `development` / `dev` | `hearth-dev` | Deployed development / preview cloud environment |
| `production` / `prod` | `hearth-prod` | Live production cloud environment |

### Environment Variables & Credentials
Set your cluster credentials and API URL in your `.env` (see [`.env.example`](.env.example)):
```bash
# Frontend API endpoint (for local dev with separate frontend/backend ports)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# MongoDB Configuration
MONGODB_USER=your_mongo_user
MONGODB_PASSWORD=your_mongo_password
MONGODB_HOST=cluster0.abcde.mongodb.net
MONGODB_DATABASE=hearth-local
```

---

## 🐳 Docker Versioning & CI/CD Deployments

### Versioned Docker Images
To ensure zero accidental downtime on existing deployments, production images are published with immutable version tags:

- **Semantic Version Releases**: Pushing a git tag (e.g. `git tag v1.0.0 && git push origin v1.0.0`) publishes:
  - `ghcr.io/<owner>/hearth:1.0.0`
  - `ghcr.io/<owner>/hearth:1.0`
  - `ghcr.io/<owner>/hearth:1`
  - `ghcr.io/<owner>/hearth:v1.0.0`
- **Immutable Commit Pinning**: Every build is tagged with its short commit SHA:
  - `ghcr.io/<owner>/hearth:sha-<commit_sha>`
- **Manual Release Dispatch**: Build custom version tags via GitHub Actions `workflow_dispatch` with custom version parameters.

### Recommended Deployment Practice
Pin your container deployment to a specific semantic tag or commit SHA rather than relying on `latest`:
```bash
# Example production deployment
docker pull ghcr.io/deep-muni/hearth:v1.0.0
docker run -d -p 8080:8080 \
  -e APP_ENV=production \
  -e MONGODB_USER="your_user" \
  -e MONGODB_PASSWORD="your_password" \
  -e MONGODB_HOST="cluster0.abcde.mongodb.net" \
  -e MONGODB_DATABASE="hearth-prod" \
  ghcr.io/deep-muni/hearth:v1.0.0
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v22+)
- pnpm (`npm install -g pnpm`)
- Go (v1.25+)
- Docker & Docker Buildx (for container builds)

### Development
```bash
# Install dependencies
pnpm install

# Run frontend & backend concurrently
pnpm dev

# Or run separately
pnpm dev:frontend   # Next.js on http://localhost:3000
pnpm dev:backend    # Go API on http://localhost:8080
```

### Quality Checks & Tests
```bash
# Run all unit tests across frontend & backend
pnpm test

# Run frontend quality checks (TSC, ESLint, Vitest, Prettier)
pnpm --filter frontend check-all

# Run backend tests
cd backend && go test -v ./...
```
