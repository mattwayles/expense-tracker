import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import type { Expense } from '@/lib/types';

const FIXED_DATE = new Date(2026, 5, 24, 12, 0, 0);

beforeEach(() => vi.setSystemTime(FIXED_DATE));
afterEach(() => vi.useRealTimers());

// ExpenseForm labels have no htmlFor, so we query by placeholder / role / display value.
function amountInput() { return screen.getByPlaceholderText('0.00'); }
function categorySelect() { return screen.getByRole('combobox'); }
function descriptionInput() { return screen.getByPlaceholderText(/what did you spend on\?/i); }
function dateInput() { return screen.getByDisplayValue('2026-06-24') as HTMLInputElement; }

function renderForm(props: Partial<React.ComponentProps<typeof ExpenseForm>> = {}) {
  const onSubmit = vi.fn();
  render(<ExpenseForm onSubmit={onSubmit} {...props} />);
  return { onSubmit };
}

const VALID_EXPENSE: Expense = {
  id: 'exp-1',
  amount: 42.5,
  category: 'Food',
  description: 'Lunch at the deli',
  date: '2026-06-15',
  createdAt: '2026-06-15T12:00:00.000Z',
};

// ── Rendering ────────────────────────────────────────────────────────────────

describe('ExpenseForm — rendering', () => {
  it('renders amount, category, description, and date fields', () => {
    renderForm();
    expect(amountInput()).toBeInTheDocument();
    expect(categorySelect()).toBeInTheDocument();
    expect(descriptionInput()).toBeInTheDocument();
    // Date field has today's value by default
    expect(screen.getByDisplayValue('2026-06-24')).toBeInTheDocument();
  });

  it('defaults category to Food', () => {
    renderForm();
    expect((categorySelect() as HTMLSelectElement).value).toBe('Food');
  });

  it('defaults date to today (2026-06-24)', () => {
    renderForm();
    expect((screen.getByDisplayValue('2026-06-24') as HTMLInputElement).value).toBe('2026-06-24');
  });

  it('shows "Add Expense" as the default submit label', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'Add Expense' })).toBeInTheDocument();
  });

  it('shows a custom submitLabel when provided', () => {
    renderForm({ submitLabel: 'Save Changes' });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('pre-fills all fields from initialData', () => {
    renderForm({ initialData: VALID_EXPENSE });
    expect((amountInput() as HTMLInputElement).value).toBe('42.5');
    expect((categorySelect() as HTMLSelectElement).value).toBe('Food');
    expect((descriptionInput() as HTMLInputElement).value).toBe('Lunch at the deli');
    // Date input now has the initialData date
    expect(screen.getByDisplayValue('2026-06-15')).toBeInTheDocument();
  });

  it('shows a Cancel button when onCancel is provided', () => {
    renderForm({ onCancel: vi.fn() });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('does not show a Cancel button when onCancel is omitted', () => {
    renderForm();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });
});

// ── Validation ───────────────────────────────────────────────────────────────

describe('ExpenseForm — validation', () => {
  it('shows an error when amount is empty on submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/valid amount greater than 0/i)).toBeInTheDocument();
  });

  it('shows an error when amount is zero', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '0');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/valid amount greater than 0/i)).toBeInTheDocument();
  });

  it('shows an error when amount is negative', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '-5');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/valid amount greater than 0/i)).toBeInTheDocument();
  });

  it('shows an error when amount exceeds $1,000,000', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '1000001');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/cannot exceed \$1,000,000/i)).toBeInTheDocument();
  });

  it('shows an error when description is empty', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '10');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/please enter a description/i)).toBeInTheDocument();
  });

  it('shows an error when description exceeds 200 characters', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '10');
    // The input has maxlength="200", so use fireEvent to bypass it and set a longer value directly.
    fireEvent.change(descriptionInput(), { target: { value: 'a'.repeat(201) } });
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/200 characters or less/i)).toBeInTheDocument();
  });

  it('shows an error when date is cleared', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(amountInput(), '10');
    await user.type(descriptionInput(), 'Test');
    const date = dateInput();
    await user.clear(date);
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/please select a date/i)).toBeInTheDocument();
  });

  it('clears the amount error when the user starts typing in the amount field', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/valid amount/i)).toBeInTheDocument();
    await user.type(amountInput(), '5');
    expect(screen.queryByText(/valid amount/i)).not.toBeInTheDocument();
  });

  it('clears the description error when the user types in the description field', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(await screen.findByText(/please enter a description/i)).toBeInTheDocument();
    await user.type(descriptionInput(), 'Hello');
    expect(screen.queryByText(/please enter a description/i)).not.toBeInTheDocument();
  });
});

// ── Submission ───────────────────────────────────────────────────────────────

describe('ExpenseForm — submission', () => {
  it('calls onSubmit with the correct data when the form is valid', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(amountInput(), '25.50');
    await user.type(descriptionInput(), 'Coffee');

    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith({
      amount: 25.5,
      category: 'Food',
      description: 'Coffee',
      date: '2026-06-24',
    });
  });

  it('rounds the submitted amount to 2 decimal places', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(amountInput(), '9.999');
    await user.type(descriptionInput(), 'Rounded');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].amount).toBe(10.0);
  });

  it('trims whitespace from description before submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(amountInput(), '10');
    await user.type(descriptionInput(), '  Padded  ');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].description).toBe('Padded');
  });

  it('does not call onSubmit when validation fails', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    renderForm({ onCancel });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('submits with the selected category', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(amountInput(), '50');
    await user.type(descriptionInput(), 'Electric bill');
    await user.selectOptions(categorySelect(), 'Bills');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0][0].category).toBe('Bills');
  });
});
