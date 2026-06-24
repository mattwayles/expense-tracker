# SpendSmart

A personal expense tracking web app built with Next.js 14, TypeScript, and Tailwind CSS. Track spending by category, visualize monthly trends, and export your data — all stored locally in the browser with no account required.

## Features

- **Add, edit, and delete expenses** with amount, category, description, and date
- **Dashboard** with summary cards (total spending, monthly total, top category, transaction count), a 6-month bar chart, and a category donut chart
- **Monthly Insights** page with a hand-crafted SVG donut, top-3 spending categories, and a budget streak tracker
- **Expense list** with live search, category filter, and date-range filter
- **CSV export** of all expenses
- **Responsive design** — sidebar navigation on desktop, bottom tab bar on mobile
- **No backend** — all data persists in `localStorage`; nothing leaves the device

## Tech stack

| Layer | Library / version |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 (bar), hand-rolled SVG (donut) |
| Icons | Lucide React |
| State | React hooks + `localStorage` |

## Getting started

### Prerequisites

- Node.js 18 or later
- npm (comes with Node)

### Install and run

```bash
# Clone the repo
git clone <repo-url>
cd expense-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app is ready to use — no environment variables or configuration required.

### Other commands

```bash
npm run build   # production build + TypeScript check
npm run start   # serve the production build locally
npm run lint    # ESLint
```

## Project structure

```
app/                    # Next.js App Router pages
  page.tsx              # Dashboard (/)
  expenses/page.tsx     # Full expense list (/expenses)
  add/page.tsx          # Add expense form (/add)
  insights/page.tsx     # Monthly insights (/insights)

components/
  Navigation.tsx        # Sidebar (desktop) + bottom tab bar (mobile)
  dashboard/            # Dashboard widgets
  expenses/             # Expense CRUD components
  ui/                   # Shared primitives (Badge, Modal)

hooks/
  useExpenses.ts        # All expense state and localStorage persistence

lib/
  types.ts              # TypeScript interfaces
  categories.ts         # Category definitions, colors, icons
  utils.ts              # Pure utility functions (formatting, filtering, export)
```

For a deeper walkthrough of conventions and architecture decisions, see [`CLAUDE.md`](./CLAUDE.md).

## Data model

Each expense has five user-facing fields:

| Field | Type | Notes |
|---|---|---|
| `amount` | `number` | USD, stored to 2 decimal places |
| `category` | `Category` | One of: Food, Transportation, Entertainment, Shopping, Bills, Other |
| `description` | `string` | Max 200 characters |
| `date` | `string` | `YYYY-MM-DD` format |
| `createdAt` | `string` | Full ISO timestamp, used as sort tiebreaker |

Data is stored under the key `expense-tracker-data` in `localStorage`. Clearing site data in the browser will erase all expenses.

## Exporting data

Go to **Expenses → Export CSV**. The downloaded file contains all expenses (not just the currently filtered view) sorted by date descending, with columns: Date, Description, Category, Amount.

## Deploying

The app has no server-side dependencies, so it deploys as a standard static Next.js site.

**Vercel (recommended):**

```bash
npm i -g vercel
vercel
```

**Self-hosted static export:**

```bash
# Add output: 'export' to next.config.ts first, then:
npm run build
# Serve the generated /out directory with any static host
```

**Docker:**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

> Note: because data lives in `localStorage`, each user's browser is their own storage. There is no shared or synced state between devices.

## Contributing

1. Fork the repo and create a branch from `master`
2. Run `npm run build` before opening a PR — the build gate runs TypeScript and catches most errors
3. Follow the conventions in [`CLAUDE.md`](./CLAUDE.md): named exports, `@/` import alias, `'use client'` at line 1 when needed, Tailwind utility classes only

## License

MIT
