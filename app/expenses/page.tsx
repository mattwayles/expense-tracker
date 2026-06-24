'use client';

import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, loaded, deleteExpense, updateExpense } = useExpenses();

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and filter your transactions</p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      <ExpenseList
        expenses={expenses}
        onDelete={deleteExpense}
        onUpdate={updateExpense}
      />
    </div>
  );
}
