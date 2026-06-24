import { Expense, ExpenseFilters } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  return expenses.filter((expense) => {
    if (filters.category !== 'All' && expense.category !== filters.category) return false;
    if (filters.dateFrom && expense.date < filters.dateFrom) return false;
    if (filters.dateTo && expense.date > filters.dateTo) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !expense.description.toLowerCase().includes(q) &&
        !expense.category.toLowerCase().includes(q) &&
        !String(expense.amount).includes(q)
      )
        return false;
    }
    return true;
  });
}

export function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = sortByDateDesc(expenses).map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${getTodayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getMonthlyTotal(expenses: Expense[]): number {
  const start = getMonthStart();
  const today = getTodayISO();
  return expenses
    .filter((e) => e.date >= start && e.date <= today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalSpending(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getTopCategory(expenses: Expense[]): { category: string; amount: number } | null {
  if (expenses.length === 0) return null;
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return { category: top[0], amount: top[1] };
}

export function getSpendingByCategory(expenses: Expense[]): { name: string; value: number; color: string }[] {
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  const colors: Record<string, string> = {
    Food: '#f97316',
    Transportation: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Bills: '#ef4444',
    Other: '#6b7280',
  };
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value, color: colors[name] ?? '#6b7280' }))
    .sort((a, b) => b.value - a.value);
}

export function getBudgetStreak(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const days = new Set(expenses.map((e) => e.date));
  let streak = 0;
  const now = new Date();
  // Walk backwards from today counting consecutive days with at least one logged expense
  for (let i = 0; i < 365; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (days.has(iso)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getCurrentMonthExpenses(expenses: Expense[]): Expense[] {
  const start = getMonthStart();
  const today = getTodayISO();
  return expenses.filter((e) => e.date >= start && e.date <= today);
}

export function getMonthlyTrend(expenses: Expense[]): { month: string; amount: number }[] {
  const now = new Date();
  const months: { month: string; amount: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearStr = d.getFullYear().toString();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const prefix = `${yearStr}-${monthStr}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const amount = expenses
      .filter((e) => e.date.startsWith(prefix))
      .reduce((sum, e) => sum + e.amount, 0);
    months.push({ month: label, amount });
  }

  return months;
}
