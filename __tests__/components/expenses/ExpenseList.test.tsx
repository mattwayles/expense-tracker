import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import type { Expense } from '@/lib/types';

const FIXED_DATE = new Date(2026, 5, 24, 12, 0, 0);

beforeEach(() => vi.setSystemTime(FIXED_DATE));
afterEach(() => vi.useRealTimers());

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 'e1',
    amount: 10.0,
    category: 'Food',
    description: 'Test',
    date: '2026-06-24',
    createdAt: '2026-06-24T12:00:00.000Z',
    ...overrides,
  };
}

const EXPENSES: Expense[] = [
  makeExpense({ id: '1', description: 'Burger', category: 'Food', amount: 12.5, date: '2026-06-10' }),
  makeExpense({ id: '2', description: 'Bus pass', category: 'Transportation', amount: 30.0, date: '2026-06-15' }),
  makeExpense({ id: '3', description: 'Netflix', category: 'Entertainment', amount: 15.99, date: '2026-06-20' }),
];

function renderList(expenses: Expense[] = EXPENSES) {
  const onDelete = vi.fn();
  const onUpdate = vi.fn();
  render(<ExpenseList expenses={expenses} onDelete={onDelete} onUpdate={onUpdate} />);
  return { onDelete, onUpdate };
}

// ── Empty state ──────────────────────────────────────────────────────────────

describe('ExpenseList — empty state', () => {
  it('shows the "No expenses yet" heading when the list is empty', () => {
    renderList([]);
    expect(screen.getByText('No expenses yet')).toBeInTheDocument();
  });

  it('shows a link to /add when the list is empty', () => {
    renderList([]);
    const link = screen.getByRole('link', { name: /add expense/i });
    expect(link).toHaveAttribute('href', '/add');
  });

  it('does not render the filter bar when the list is empty', () => {
    renderList([]);
    expect(screen.queryByText('Filters')).not.toBeInTheDocument();
  });
});

// ── Populated list ───────────────────────────────────────────────────────────

describe('ExpenseList — populated list', () => {
  it('renders a card for each expense', () => {
    renderList();
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.getByText('Bus pass')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('renders the filter bar', () => {
    renderList();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('shows the total count in the result count text', () => {
    renderList();
    // FilterBar renders "Showing N of N expenses" across span children.
    // Check the two count spans both show 3.
    const countSpans = screen.getAllByText('3');
    expect(countSpans.length).toBeGreaterThanOrEqual(2);
  });

  it('shows an export CSV button', () => {
    renderList();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
  });
});

// ── Filtering ────────────────────────────────────────────────────────────────

describe('ExpenseList — filtering', () => {
  it('filters by search term and hides non-matching expenses', async () => {
    const user = userEvent.setup();
    renderList();
    const searchInput = screen.getByPlaceholderText(/search expenses/i);
    await user.type(searchInput, 'burger');
    expect(screen.getByText('Burger')).toBeInTheDocument();
    expect(screen.queryByText('Bus pass')).not.toBeInTheDocument();
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
  });

  it('filters by category via the category select', async () => {
    const user = userEvent.setup();
    renderList();
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Transportation');
    expect(screen.queryByText('Burger')).not.toBeInTheDocument();
    expect(screen.getByText('Bus pass')).toBeInTheDocument();
    expect(screen.queryByText('Netflix')).not.toBeInTheDocument();
  });

  it('shows "no expenses match" empty state when filters eliminate all results', async () => {
    const user = userEvent.setup();
    renderList();
    const searchInput = screen.getByPlaceholderText(/search expenses/i);
    await user.type(searchInput, 'zzz-no-match');
    expect(await screen.findByText(/no expenses match your filters/i)).toBeInTheDocument();
  });

  it('shows "Clear filters" button when filters are active', async () => {
    const user = userEvent.setup();
    renderList();
    const searchInput = screen.getByPlaceholderText(/search expenses/i);
    await user.type(searchInput, 'burger');
    expect(await screen.findByText(/clear/i)).toBeInTheDocument();
  });

  it('restores all expenses when "Clear filters" is clicked', async () => {
    const user = userEvent.setup();
    renderList();
    const searchInput = screen.getByPlaceholderText(/search expenses/i);
    await user.type(searchInput, 'zzz-no-match');
    const clearBtn = await screen.findByRole('button', { name: /clear filters/i });
    await user.click(clearBtn);
    await waitFor(() => expect(screen.getByText('Burger')).toBeInTheDocument());
    expect(screen.getByText('Bus pass')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('shows the filtered count in the result count text', async () => {
    const user = userEvent.setup();
    renderList();
    const searchInput = screen.getByPlaceholderText(/search expenses/i);
    await user.type(searchInput, 'burger');
    await waitFor(() => {
      // Should display "Showing 1 of 3 expenses"
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

// ── Sorting ──────────────────────────────────────────────────────────────────

describe('ExpenseList — display order', () => {
  it('displays expenses sorted by date descending', () => {
    renderList();
    const cards = screen.getAllByTitle(/edit|delete/i);
    // Netflix (Jun 20) should appear before Bus pass (Jun 15) before Burger (Jun 10)
    const descriptions = screen.getAllByText(/Netflix|Bus pass|Burger/);
    expect(descriptions[0].textContent).toBe('Netflix');
    expect(descriptions[1].textContent).toBe('Bus pass');
    expect(descriptions[2].textContent).toBe('Burger');
  });
});
