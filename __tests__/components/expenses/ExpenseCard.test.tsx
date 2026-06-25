import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseCard } from '@/components/expenses/ExpenseCard';
import type { Expense } from '@/lib/types';

const FIXED_DATE = new Date(2026, 5, 24, 12, 0, 0);

beforeEach(() => vi.setSystemTime(FIXED_DATE));
afterEach(() => vi.useRealTimers());

const SAMPLE: Expense = {
  id: 'card-1',
  amount: 42.5,
  category: 'Food',
  description: 'Lunch at the deli',
  date: '2026-06-15',
  createdAt: '2026-06-15T12:00:00.000Z',
};

function renderCard(overrides: Partial<Expense> = {}) {
  const onDelete = vi.fn();
  const onUpdate = vi.fn();
  const expense = { ...SAMPLE, ...overrides };
  render(<ExpenseCard expense={expense} onDelete={onDelete} onUpdate={onUpdate} />);
  return { onDelete, onUpdate };
}

// ── Rendering ────────────────────────────────────────────────────────────────

describe('ExpenseCard — rendering', () => {
  it('displays the expense description', () => {
    renderCard();
    expect(screen.getByText('Lunch at the deli')).toBeInTheDocument();
  });

  it('displays the formatted amount', () => {
    renderCard();
    expect(screen.getByText('$42.50')).toBeInTheDocument();
  });

  it('displays the category badge', () => {
    renderCard();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('displays the formatted date', () => {
    renderCard();
    expect(screen.getByText('Jun 15, 2026')).toBeInTheDocument();
  });

  it('renders the edit button', () => {
    renderCard();
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
  });

  it('renders the delete button', () => {
    renderCard();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });
});

// ── Delete flow ──────────────────────────────────────────────────────────────

describe('ExpenseCard — delete flow', () => {
  it('opens the delete confirmation modal when delete is clicked', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Delete'));
    expect(await screen.findByText('Delete Expense')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete "Lunch at the deli"/)).toBeInTheDocument();
  });

  it('calls onDelete with the expense id when deletion is confirmed', async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();
    await user.click(screen.getByTitle('Delete'));
    // Two "Delete"-named buttons exist: the card icon (title attr) and the modal confirm.
    // The modal confirm is rendered after the card in the DOM so it's the last one.
    const deleteButtons = await screen.findAllByRole('button', { name: 'Delete' });
    await user.click(deleteButtons[deleteButtons.length - 1]);
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('card-1'));
  });

  it('does not call onDelete when deletion is cancelled', async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();
    await user.click(screen.getByTitle('Delete'));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('closes the confirmation modal after cancellation', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Delete'));
    expect(await screen.findByText('Delete Expense')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Delete Expense')).not.toBeInTheDocument());
  });
});

// ── Edit flow ────────────────────────────────────────────────────────────────

describe('ExpenseCard — edit flow', () => {
  it('opens the edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Edit'));
    expect(await screen.findByText('Edit Expense')).toBeInTheDocument();
  });

  it('pre-populates the edit form with the current expense data', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Edit'));
    const descInput = await screen.findByDisplayValue('Lunch at the deli');
    expect(descInput).toBeInTheDocument();
  });

  it('calls onUpdate with updated data when the edit form is submitted', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderCard();
    await user.click(screen.getByTitle('Edit'));
    const descInput = await screen.findByDisplayValue('Lunch at the deli');
    await user.clear(descInput);
    await user.type(descInput, 'Dinner at the deli');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(
        'card-1',
        expect.objectContaining({ description: 'Dinner at the deli' })
      )
    );
  });

  it('closes the edit modal after the form is submitted', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Edit'));
    expect(await screen.findByText('Edit Expense')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    await waitFor(() => expect(screen.queryByText('Edit Expense')).not.toBeInTheDocument());
  });

  it('closes the edit modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTitle('Edit'));
    expect(await screen.findByText('Edit Expense')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByText('Edit Expense')).not.toBeInTheDocument());
  });
});
