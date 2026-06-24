# SpendSmart — Expense Tracker

Personal finance tracking app built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.
Data is persisted to `localStorage`; there is no backend or database.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (also runs TypeScript check)
npm run lint     # ESLint
```

## Project structure

```
app/                        # Next.js App Router pages (default exports)
  layout.tsx                # Root layout — mounts <Navigation> and sets <body> class
  page.tsx                  # Dashboard (/)
  expenses/page.tsx         # Expense list (/expenses)
  add/page.tsx              # Add expense form (/add)
  insights/page.tsx         # Monthly insights (/insights)

components/
  Navigation.tsx            # Sidebar (desktop) + bottom tab bar (mobile)
  dashboard/                # Dashboard-specific display components
    SummaryCards.tsx
    SpendingChart.tsx       # Recharts bar chart
    CategoryBreakdown.tsx   # Recharts donut chart
    RecentExpenses.tsx
    MonthlyInsights.tsx     # Hand-rolled SVG donut + top-3 list + streak card
  expenses/                 # Expense CRUD components
    ExpenseCard.tsx         # Single row with inline edit/delete
    ExpenseForm.tsx         # Add/edit form with validation
    ExpenseList.tsx         # Filter bar + card list
    FilterBar.tsx           # Search, category, date-range filters
  ui/                       # Shared primitives
    Badge.tsx               # <CategoryBadge>
    Modal.tsx               # <Modal> and <ConfirmModal>

hooks/
  useExpenses.ts            # Single source of truth for all expense state

lib/
  types.ts                  # TypeScript interfaces and union types
  categories.ts             # CATEGORIES array, getCategoryMeta(), CATEGORY_NAMES
  utils.ts                  # Pure functions: formatting, filtering, aggregation, CSV export
```

## Architecture

### State management

There is **no global state library**. All state lives in the `useExpenses` hook
(`hooks/useExpenses.ts`), which is called independently in each page component.
Because every call reads from and writes to the same `localStorage` key
(`'expense-tracker-data'`), state stays consistent across pages on navigation.

```ts
const { expenses, loaded, addExpense, updateExpense, deleteExpense } = useExpenses();
```

- **`loaded`** — starts `false`, flips `true` after the first `useEffect` hydration
  from `localStorage`. Every page must gate its render on `loaded` to avoid a
  flash of empty content or a hydration mismatch.
- All mutation functions (`addExpense`, `updateExpense`, `deleteExpense`) are
  wrapped in `useCallback` to prevent unnecessary re-renders. They call an
  internal `persist()` that sets state and writes `localStorage` atomically.

### Data flow

```
localStorage
    │
    ▼
useExpenses()   ←── called by each page
    │
    ▼
Page component  ──── passes `expenses` + callbacks down as props
    │
    ▼
Display/form components (pure, receive data and handlers as props)
```

Pages are thin orchestrators — they own the loading spinner and the
`useExpenses` call, nothing else. Business logic belongs in `lib/utils.ts`.

### Data model

Defined in `lib/types.ts`. Do not add fields to `Expense` without considering
the `localStorage` migration story (there is none — existing records will be
missing new fields until re-entered).

```ts
interface Expense {
  id: string;          // generateId() — timestamp + random suffix
  amount: number;      // stored as float, always 2 decimal places
  category: Category;  // one of the six union literal values
  description: string; // max 200 characters
  date: string;        // YYYY-MM-DD (local date, not UTC)
  createdAt: string;   // full ISO timestamp, used as tiebreaker in sort
}
```

**Dates are always stored as `YYYY-MM-DD` strings** — never as `Date` objects
or timestamps. Use `getTodayISO()` from `lib/utils.ts` to produce today's date.
Formatting for display goes through `formatDate()` (uses `Intl.DateTimeFormat`);
`date-fns` is installed but the project uses `Intl` APIs instead.

**Amounts** are rounded to 2 decimal places on save:
`Math.round(parseFloat(raw) * 100) / 100`. Never store raw user input.

## Code conventions

### TypeScript

- Strict mode is on (`"strict": true` in tsconfig). No `any`, no non-null
  assertion (`!`) unless unavoidable.
- All public-facing prop shapes get a named `interface`, defined at the top of
  the file that uses them. Do not export prop interfaces — they are file-local.
- Prefer `type` for union types (`Category`) and `interface` for object shapes
  (`Expense`, `ExpenseFilters`).
- Use `Partial<Omit<Expense, 'id' | 'createdAt'>>` for update payloads — never
  accept `id` or `createdAt` in a mutation argument.
- Export `ReturnType<typeof useExpenses>` as `UseExpensesReturn` for cases where
  the hook return type needs to be referenced externally.

### React components

- **Named exports only** for all components except Next.js pages.
  Next.js pages use `export default function`.
- Mark a file `'use client'` at line 1 when it uses any hook, event handler,
  `useState`, `useEffect`, browser API, or `'use client'` import.
- `lib/types.ts`, `lib/categories.ts`, and pure `lib/utils.ts` functions need
  no directive — they are safe to import in Server Components.
- Every component file exports **one primary component**. Helper sub-components
  (e.g. `CustomTooltip`, `DonutChart`) live in the same file but are not exported.
- Prefer function declarations inside the file for local helpers; use arrow
  functions for callbacks and event handlers inside JSX.

### Import order and paths

Always use the `@/` alias — never relative `../` paths.

```ts
// 1. React and Next.js
import { useState, useCallback } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { PieChart, Pie } from 'recharts';
import { Trash2 } from 'lucide-react';

// 3. Internal — types and lib
import { Expense, Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { getCategoryMeta } from '@/lib/categories';

// 4. Internal — hooks and components
import { useExpenses } from '@/hooks/useExpenses';
import { CategoryBadge } from '@/components/ui/Badge';
```

### Styling

Tailwind CSS v4 is used via `@import "tailwindcss"` in `app/globals.css`.
There is no `tailwind.config.js` — v4 uses CSS-native configuration.

**Color palette in use:**

| Role | Classes |
|---|---|
| Primary CTA | `bg-indigo-600 hover:bg-indigo-700` |
| Active nav | `bg-indigo-600 text-white` |
| Danger | `bg-red-500 hover:bg-red-600` |
| Primary text | `text-gray-900` |
| Secondary text | `text-gray-600` / `text-gray-700` |
| Tertiary / metadata | `text-gray-400` / `text-gray-500` |
| Card background | `bg-white` |
| Page background | `bg-gray-50` |
| Borders | `border-gray-100` (cards) · `border-gray-200` (inputs, dividers) |

**Border-radius scale:**

- Interactive controls (buttons, inputs, badges): `rounded-lg` or `rounded-xl`
- Cards and panels: `rounded-2xl`
- Hero/feature cards (e.g. `MonthlyInsights`): `rounded-3xl`
- Pills / tags: `rounded-full`

**Shadow scale:**

- Standard card: `shadow-sm`
- Elevated / floating: `shadow-md`
- Tooltip: `shadow-lg`
- Modal: `shadow-2xl`

**Transition convention:**

- Color-only hover: `transition-colors`
- Shadow + border + color combined: `transition-all`
- Default duration is Tailwind's 150 ms; do not set a custom duration unless
  there is a strong UX reason.

**Hover-reveal pattern** (action buttons inside cards):

```tsx
<div className="group ...">
  {/* always-visible content */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    {/* edit / delete buttons */}
  </div>
</div>
```

### Categories

All category logic lives in `lib/categories.ts`. The six categories are a
closed set (`Category` union type). Never hard-code category strings or colors
inline — always go through `getCategoryMeta(category)`.

Each category has:
- `color` — hex string for SVG fills and chart segments
- `bgColor` — Tailwind `bg-*` class for badge backgrounds
- `textColor` — Tailwind `text-*` class for badge text
- `icon` — emoji string

### Icons

All icons come from `lucide-react`. Do not introduce a second icon library.
Always size icons with explicit `h-N w-N` classes (`h-4 w-4` for inline, `h-5
w-5` for nav/buttons, `h-8 w-8` for empty-state illustrations).

### Charts

- **Bar charts** (SpendingChart): Recharts `BarChart` + `ResponsiveContainer`.
  Always provide a `CustomTooltip` component rather than using Recharts defaults.
  Return `null` from the tooltip when `!active || !payload?.length`.
- **Donut / pie charts** (MonthlyInsights): hand-rolled SVG using `segmentPath()`
  and `toXY()` helpers. Recharts `PieChart` with `ResponsiveContainer` causes
  segment mis-positioning in SSR / headless environments; use plain SVG instead.
  The SVG size is always set with explicit `width` and `height` props, never
  percentages.

### Forms

`ExpenseForm` is the single form component for both add and edit flows. It
receives `initialData?: Expense` and `submitLabel?: string` to adapt between
contexts. Validation runs synchronously in `validate()` before submission; errors
are stored in a `FormErrors` state object keyed by field name.

The `field(name)` helper pattern keeps JSX clean:

```ts
const field = (name: keyof FormData) => ({
  value: form[name],
  onChange: (e: React.ChangeEvent<...>) => {
    setForm(f => ({ ...f, [name]: e.target.value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  },
});
```

### Modals

`Modal` and `ConfirmModal` live in `components/ui/Modal.tsx`. `ConfirmModal`
wraps `Modal` — do not replicate its logic. Modals:
- Close on `Escape` (registered in a `useEffect` that cleans up on unmount)
- Close on backdrop click (`onClick={onClose}` on the overlay div)
- Use `backdrop-blur-sm` + `bg-black/50` for the overlay

### Empty states

Use a dashed-border container with centered text and an optional CTA:

```tsx
<div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
  <p className="text-gray-500 font-medium">No expenses match your filters</p>
  <button onClick={clear} className="mt-3 text-sm text-indigo-600 ...">Clear filters</button>
</div>
```

### Loading state

All pages that depend on `useExpenses` must guard against the pre-hydration
state with the canonical spinner:

```tsx
if (!loaded) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}
```

## Adding a new page

1. Create `app/<route>/page.tsx` with `'use client'` and a default export.
2. Call `useExpenses()` at the top; gate on `loaded`.
3. Add the route to `NAV_ITEMS` in `components/Navigation.tsx`. The sidebar and
   mobile tab bar are generated from the same array — adding an entry updates both.
4. Choose an icon from `lucide-react` (not a new library).

## Adding a new utility function

Pure functions that derive data from `Expense[]` belong in `lib/utils.ts`.
Functions that produce UI metadata (colors, labels) belong in `lib/categories.ts`.
Neither file should import from `components/` or `hooks/`.

## What to avoid

- **Do not introduce a state management library** (Redux, Zustand, Jotai, etc.).
  The `useExpenses` hook is intentionally the full state layer.
- **Do not use `React.Context`** to share expense state. Pages call `useExpenses`
  directly; prop-drill if a child needs data.
- **Do not add new categories** without updating the `Category` union type in
  `lib/types.ts` and the `CATEGORIES` array in `lib/categories.ts` — both must
  stay in sync.
- **Do not store `Date` objects or Unix timestamps** for the `date` field. Use
  `YYYY-MM-DD` strings and `getTodayISO()`.
- **Do not use `ResponsiveContainer` for standalone donut/pie charts** — use
  explicit SVG with pixel dimensions instead.
- **Do not add default exports to component files** — only page files under
  `app/` use default exports.
- **Do not add comments that describe what the code does** — only add a comment
  when a non-obvious constraint or workaround needs explanation (e.g. the SVG
  donut note about Recharts SSR mis-positioning).
