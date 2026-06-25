import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatCurrency,
  formatDate,
  getTodayISO,
  getMonthStart,
  getCurrentMonthLabel,
  filterExpenses,
  sortByDateDesc,
  generateId,
  getMonthlyTotal,
  getTotalSpending,
  getTopCategory,
  getSpendingByCategory,
  getBudgetStreak,
  getCurrentMonthExpenses,
  getMonthlyTrend,
} from '@/lib/utils';
import type { Expense, ExpenseFilters } from '@/lib/types';

// Fixed test date: 2026-06-24
const FIXED_DATE = new Date(2026, 5, 24, 12, 0, 0); // month is 0-indexed

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'test-id',
    amount: 10.0,
    category: 'Food',
    description: 'Test expense',
    date: '2026-06-24',
    createdAt: '2026-06-24T12:00:00.000Z',
    ...overrides,
  };
}

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
};

// ── formatCurrency ──────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats a positive integer as USD', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats a decimal amount to 2 places', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large amounts with comma separator', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });
});

// ── formatDate ──────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a YYYY-MM-DD string as a readable date', () => {
    expect(formatDate('2026-01-15')).toBe('Jan 15, 2026');
  });

  it('formats end-of-month dates correctly', () => {
    expect(formatDate('2026-12-31')).toBe('Dec 31, 2026');
  });

  it('formats February 28', () => {
    expect(formatDate('2026-02-28')).toBe('Feb 28, 2026');
  });

  it('formats June 24', () => {
    expect(formatDate('2026-06-24')).toBe('Jun 24, 2026');
  });
});

// ── getTodayISO ─────────────────────────────────────────────────────────────

describe('getTodayISO', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns today in YYYY-MM-DD format', () => {
    expect(getTodayISO()).toBe('2026-06-24');
  });

  it('zero-pads month and day', () => {
    vi.setSystemTime(new Date(2026, 0, 5)); // Jan 5
    expect(getTodayISO()).toBe('2026-01-05');
  });
});

// ── getMonthStart ───────────────────────────────────────────────────────────

describe('getMonthStart', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns the first day of the current month', () => {
    expect(getMonthStart()).toBe('2026-06-01');
  });

  it('zero-pads months below 10', () => {
    vi.setSystemTime(new Date(2026, 2, 15)); // March 15
    expect(getMonthStart()).toBe('2026-03-01');
  });
});

// ── getCurrentMonthLabel ────────────────────────────────────────────────────

describe('getCurrentMonthLabel', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns the full month name and 4-digit year', () => {
    expect(getCurrentMonthLabel()).toBe('June 2026');
  });
});

// ── filterExpenses ──────────────────────────────────────────────────────────

describe('filterExpenses', () => {
  const expenses: Expense[] = [
    makeExpense({ id: '1', description: 'Burger King', category: 'Food', amount: 12.5, date: '2026-06-10' }),
    makeExpense({ id: '2', description: 'Bus pass', category: 'Transportation', amount: 30.0, date: '2026-06-15' }),
    makeExpense({ id: '3', description: 'Netflix', category: 'Entertainment', amount: 15.99, date: '2026-06-20' }),
    makeExpense({ id: '4', description: 'Groceries', category: 'Food', amount: 75.0, date: '2026-05-28' }),
  ];

  it('returns all expenses when all filters are default', () => {
    expect(filterExpenses(expenses, DEFAULT_FILTERS)).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, category: 'Food' });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.category === 'Food')).toBe(true);
  });

  it('filters by search term matching description', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: 'burger' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by search term matching category name', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: 'transportation' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters by search term matching amount string', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: '15.99' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('search is case-insensitive', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: 'NETFLIX' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('filters by dateFrom (inclusive)', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, dateFrom: '2026-06-15' });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['2', '3']));
  });

  it('filters by dateTo (inclusive)', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, dateTo: '2026-06-10' });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['1', '4']));
  });

  it('filters by a date range', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, dateFrom: '2026-06-10', dateTo: '2026-06-15' });
    expect(result).toHaveLength(2);
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['1', '2']));
  });

  it('returns empty array when no expenses match', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: 'zzz-no-match' });
    expect(result).toHaveLength(0);
  });

  it('returns empty array for empty expense list', () => {
    expect(filterExpenses([], DEFAULT_FILTERS)).toHaveLength(0);
  });

  it('combines category and search filters', () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, category: 'Food', search: 'grocer' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });
});

// ── sortByDateDesc ──────────────────────────────────────────────────────────

describe('sortByDateDesc', () => {
  it('sorts expenses by date descending', () => {
    const expenses = [
      makeExpense({ id: 'a', date: '2026-06-10', createdAt: '2026-06-10T10:00:00.000Z' }),
      makeExpense({ id: 'b', date: '2026-06-20', createdAt: '2026-06-20T10:00:00.000Z' }),
      makeExpense({ id: 'c', date: '2026-06-01', createdAt: '2026-06-01T10:00:00.000Z' }),
    ];
    const sorted = sortByDateDesc(expenses);
    expect(sorted.map((e) => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('tiebreaks by createdAt descending when dates are equal', () => {
    const expenses = [
      makeExpense({ id: 'x', date: '2026-06-15', createdAt: '2026-06-15T08:00:00.000Z' }),
      makeExpense({ id: 'y', date: '2026-06-15', createdAt: '2026-06-15T18:00:00.000Z' }),
    ];
    const sorted = sortByDateDesc(expenses);
    expect(sorted.map((e) => e.id)).toEqual(['y', 'x']);
  });

  it('does not mutate the original array', () => {
    const original = [
      makeExpense({ id: 'a', date: '2026-06-01' }),
      makeExpense({ id: 'b', date: '2026-06-20' }),
    ];
    const copy = [...original];
    sortByDateDesc(original);
    expect(original).toEqual(copy);
  });
});

// ── generateId ──────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs on consecutive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });

  it('includes a timestamp prefix and random suffix separated by a dash', () => {
    const id = generateId();
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

// ── getTotalSpending ─────────────────────────────────────────────────────────

describe('getTotalSpending', () => {
  it('returns 0 for an empty array', () => {
    expect(getTotalSpending([])).toBe(0);
  });

  it('sums all expense amounts', () => {
    const expenses = [
      makeExpense({ amount: 10.0 }),
      makeExpense({ amount: 20.5 }),
      makeExpense({ amount: 5.25 }),
    ];
    expect(getTotalSpending(expenses)).toBeCloseTo(35.75);
  });

  it('handles a single expense', () => {
    expect(getTotalSpending([makeExpense({ amount: 99.99 })])).toBeCloseTo(99.99);
  });
});

// ── getMonthlyTotal ──────────────────────────────────────────────────────────

describe('getMonthlyTotal', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('sums only expenses in the current month', () => {
    const expenses = [
      makeExpense({ amount: 50.0, date: '2026-06-10' }),
      makeExpense({ amount: 25.0, date: '2026-06-24' }),
      makeExpense({ amount: 100.0, date: '2026-05-31' }), // previous month
    ];
    expect(getMonthlyTotal(expenses)).toBeCloseTo(75.0);
  });

  it('returns 0 when there are no current-month expenses', () => {
    const expenses = [makeExpense({ amount: 100.0, date: '2026-05-15' })];
    expect(getMonthlyTotal(expenses)).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(getMonthlyTotal([])).toBe(0);
  });
});

// ── getTopCategory ───────────────────────────────────────────────────────────

describe('getTopCategory', () => {
  it('returns null for an empty array', () => {
    expect(getTopCategory([])).toBeNull();
  });

  it('returns the category with the highest total spend', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 30 }),
      makeExpense({ category: 'Food', amount: 20 }),
      makeExpense({ category: 'Bills', amount: 100 }),
      makeExpense({ category: 'Shopping', amount: 10 }),
    ];
    const top = getTopCategory(expenses);
    expect(top?.category).toBe('Bills');
    expect(top?.amount).toBe(100);
  });

  it('aggregates amounts across multiple expenses in the same category', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 40 }),
      makeExpense({ category: 'Food', amount: 60 }),
      makeExpense({ category: 'Bills', amount: 90 }),
    ];
    const top = getTopCategory(expenses);
    expect(top?.category).toBe('Food');
    expect(top?.amount).toBe(100);
  });
});

// ── getSpendingByCategory ────────────────────────────────────────────────────

describe('getSpendingByCategory', () => {
  it('returns empty array for no expenses', () => {
    expect(getSpendingByCategory([])).toEqual([]);
  });

  it('groups expenses by category and sums amounts', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 30 }),
      makeExpense({ category: 'Food', amount: 20 }),
      makeExpense({ category: 'Bills', amount: 100 }),
    ];
    const result = getSpendingByCategory(expenses);
    const food = result.find((r) => r.name === 'Food');
    const bills = result.find((r) => r.name === 'Bills');
    expect(food?.value).toBe(50);
    expect(bills?.value).toBe(100);
  });

  it('sorts results by value descending', () => {
    const expenses = [
      makeExpense({ category: 'Food', amount: 30 }),
      makeExpense({ category: 'Bills', amount: 100 }),
      makeExpense({ category: 'Shopping', amount: 50 }),
    ];
    const result = getSpendingByCategory(expenses);
    const values = result.map((r) => r.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it('assigns the correct color to each known category', () => {
    const expenses = [makeExpense({ category: 'Food', amount: 10 })];
    const result = getSpendingByCategory(expenses);
    expect(result[0].color).toBe('#f97316');
  });

  it('falls back to gray for an unknown category', () => {
    const expenses = [makeExpense({ category: 'Other', amount: 10 })];
    const result = getSpendingByCategory(expenses);
    expect(result[0].color).toBe('#6b7280');
  });
});

// ── getBudgetStreak ──────────────────────────────────────────────────────────

describe('getBudgetStreak', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns 0 for an empty expense array', () => {
    expect(getBudgetStreak([])).toBe(0);
  });

  it('returns 0 when today has no expense but yesterday does', () => {
    const expenses = [makeExpense({ date: '2026-06-23' })];
    expect(getBudgetStreak(expenses)).toBe(0);
  });

  it('returns 1 when only today has an expense', () => {
    const expenses = [makeExpense({ date: '2026-06-24' })];
    expect(getBudgetStreak(expenses)).toBe(1);
  });

  it('returns the correct streak for consecutive days including today', () => {
    const expenses = [
      makeExpense({ date: '2026-06-24' }),
      makeExpense({ date: '2026-06-23' }),
      makeExpense({ date: '2026-06-22' }),
    ];
    expect(getBudgetStreak(expenses)).toBe(3);
  });

  it('breaks the streak on a missing day', () => {
    const expenses = [
      makeExpense({ date: '2026-06-24' }),
      makeExpense({ date: '2026-06-23' }),
      // gap: June 22 is missing
      makeExpense({ date: '2026-06-21' }),
    ];
    expect(getBudgetStreak(expenses)).toBe(2);
  });

  it('counts each date once even with multiple expenses on the same day', () => {
    const expenses = [
      makeExpense({ date: '2026-06-24' }),
      makeExpense({ date: '2026-06-24' }),
      makeExpense({ date: '2026-06-23' }),
    ];
    expect(getBudgetStreak(expenses)).toBe(2);
  });
});

// ── getCurrentMonthExpenses ──────────────────────────────────────────────────

describe('getCurrentMonthExpenses', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns only expenses in the current month', () => {
    const expenses = [
      makeExpense({ id: 'a', date: '2026-06-01' }),
      makeExpense({ id: 'b', date: '2026-06-24' }),
      makeExpense({ id: 'c', date: '2026-05-31' }),
      makeExpense({ id: 'd', date: '2026-07-01' }), // future month
    ];
    const result = getCurrentMonthExpenses(expenses);
    expect(result.map((e) => e.id)).toEqual(expect.arrayContaining(['a', 'b']));
    expect(result.map((e) => e.id)).not.toContain('c');
    expect(result.map((e) => e.id)).not.toContain('d');
  });

  it('returns empty array when there are no current-month expenses', () => {
    const expenses = [makeExpense({ date: '2026-05-15' })];
    expect(getCurrentMonthExpenses(expenses)).toHaveLength(0);
  });
});

// ── getMonthlyTrend ──────────────────────────────────────────────────────────

describe('getMonthlyTrend', () => {
  beforeEach(() => vi.setSystemTime(FIXED_DATE));
  afterEach(() => vi.useRealTimers());

  it('returns exactly 6 months of data', () => {
    expect(getMonthlyTrend([])).toHaveLength(6);
  });

  it('all amounts are 0 when there are no expenses', () => {
    const trend = getMonthlyTrend([]);
    expect(trend.every((m) => m.amount === 0)).toBe(true);
  });

  it('the last entry corresponds to the current month', () => {
    const trend = getMonthlyTrend([]);
    // Current month is June 2026 — label like "Jun 26"
    expect(trend[trend.length - 1].month).toContain('Jun');
  });

  it('sums expenses correctly into the correct month bucket', () => {
    const expenses = [
      makeExpense({ amount: 50, date: '2026-06-10' }),
      makeExpense({ amount: 30, date: '2026-06-20' }),
      makeExpense({ amount: 100, date: '2026-05-15' }),
    ];
    const trend = getMonthlyTrend(expenses);
    const june = trend.find((m) => m.month.startsWith('Jun'));
    const may = trend.find((m) => m.month.startsWith('May'));
    expect(june?.amount).toBe(80);
    expect(may?.amount).toBe(100);
  });

  it('oldest month entry is 5 months ago', () => {
    const trend = getMonthlyTrend([]);
    // Fixed date is June 2026; 5 months back is January 2026
    expect(trend[0].month).toContain('Jan');
  });
});
