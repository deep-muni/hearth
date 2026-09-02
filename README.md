# 🌸 House Help Budget & Attendance Tracker

A delightful, cute, and modern monorepo application to manage household staff (cooks, housekeepers, drivers, nannies, gardeners), track daily attendance and leaves on a cheerful monthly calendar, and automatically calculate fair salary payouts with bonuses, advances, and paid leave allowances.

---

## ✨ Features

- **🌸 Cute Pastel Theme**: Built with **Chakra UI v3** customized with soft pinks, lavender mist, mint green, butter yellow, and playful rounded cards.
- **📅 Interactive Monthly Calendar**:
  - Automatically loads for the **current month** with easy previous/next month navigation and "Today" shortcut.
  - Switch between house staff with cute avatar tabs showing their leave tally.
  - Click any day to toggle status: **Present (✅)**, **Full Day Leave (🚫)**, **Half Day Leave (🌓)**, **Paid Leave (🎁)**, or **Weekly Off (☕)**.
  - Attach optional notes/reasons for leaves (e.g., *"Doctor appointment"*, *"Hometown trip"*).
  - One-click bulk action: *"Fill All Present"*.
- **💰 Smart Salary Calculation Engine**:
  - **Fixed Monthly Salary**: Base monthly pay with allowed paid leaves quota (e.g. 2 free leaves/month). Only extra leaves beyond the allowance are deducted proportionately.
  - **Daily Wage Model**: Pay computed per active working day.
  - **Strict Flat Model**: Fixed stipend with no deductions.
  - **Realtime Adjustments**: Add festival bonuses/tips (+) or deduct advance loans (-).
  - **Mark as Paid Action**: Record payment method (UPI, Cash, Bank Transfer) with celebration confetti!
  - **Printable / Shareable Pay Slip**: Clean receipt with full mathematical breakdown.
- **⚙️ Staff Configuration**:
  - Add, edit, and remove house staff.
  - Pick cute emoji avatars, custom roles, theme colors, base salary, allowed paid leaves, and weekly off days.
- **💾 Local Persistence & Portability**:
  - In-memory cache synchronized with `localStorage` (via React's `useSyncExternalStore`).
  - Pre-seeded with 3 realistic sample helpers (**Sunita - Cook**, **Ramesh - Driver**, **Pinky - Housekeeper**).
  - Export & import full JSON backups.
  - Reset to demo data anytime.
- **🏗️ Monorepo Architecture**:
  - `frontend/`: Next.js 16 (Turbopack), React 19, TypeScript, Chakra UI v3, Lucide icons, pnpm workspace.
  - `backend/`: Go 1.25 REST API skeleton (`cmd/server/main.go`, `internal/models/models.go`) ready for future cloud sync.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- Go (v1.22+)

### Run Frontend
```bash
# Install dependencies (already installed in workspace)
pnpm install

# Start Next.js development server
pnpm dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser!

### Build Frontend
```bash
pnpm build:frontend
```

### Run Go Backend (Optional / Future Ready)
```bash
pnpm dev:backend
```
Backend runs on `http://localhost:8080/api/health`.

---

## 📁 Monorepo Structure

```
house-help-budget/
├── pnpm-workspace.yaml        # pnpm workspace configuration
├── package.json               # Root monorepo scripts
├── Makefile                   # Convenient make commands
├── frontend/                  # Next.js frontend application
│   ├── src/
│   │   ├── app/               # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/
│   │   │   ├── calendar/      # CalendarView, DayDetailModal
│   │   │   ├── summary/       # MonthlySummaryView, PaySlipModal
│   │   │   ├── config/        # ConfigView (add/edit staff, backup/restore)
│   │   │   ├── common/        # Header with month picker & budget stats
│   │   │   └── ui/            # Chakra UI v3 styled component snippets
│   │   ├── services/          # storageService (in-memory + localStorage repository)
│   │   ├── utils/             # salaryCalculator, dateUtils
│   │   ├── types/             # TypeScript types for helpers, attendance, adjustments
│   │   └── theme/             # Custom cute pastel Chakra UI system
│   └── tsconfig.json
└── backend/                   # Go backend module
    ├── cmd/
    │   └── server/main.go     # Go HTTP server with health check & models
    ├── internal/
    │   └── models/models.go   # Go structs matching frontend domain models
    └── go.mod
```

---

## 🧮 Salary Calculation Rules

| Salary Model | Calendar Requirement | How It Works |
|---|---|---|
| **Days & Leaves** | **Needs Calendar** | `Net Pay = Base Salary - (Deductible Leaves × Per-Day Rate) + Bonus - Advance`<br>*(Deductible leaves = max(0, total leaves taken - paid leaves allowance))* |
| **Fixed Salary** | **No Calendar Needed** | `Net Pay = Base Salary + Bonus - Advance`<br>*(Fixed monthly stipend with no daily attendance tracking)* |
| **Based on Count** | **Needs Calendar (Item Logging)** | `Net Pay = (Total Items Given in Month × Rate per Item) + Bonus - Advance`<br>*(Track how many items/units were given on each date)* |
