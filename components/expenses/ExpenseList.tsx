'use client';

import { useState, useMemo } from 'react';
import { Download, Plus, Receipt } from 'lucide-react';
import { Expense, ExpenseFilters } from '@/lib/types';
import { filterExpenses, sortByDateDesc, exportToCSV } from '@/lib/utils';
import { FilterBar } from './FilterBar';
import { ExpenseCard } from './ExpenseCard';
import Link from 'next/link';

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
};

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
}

export function ExpenseList({ expenses, onDelete, onUpdate }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => sortByDateDesc(filterExpenses(expenses, filters)),
    [expenses, filters]
  );

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
          <Receipt className="h-8 w-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No expenses yet</h3>
        <p className="mt-1 text-sm text-gray-500">Start tracking your spending by adding your first expense.</p>
        <Link
          href="/add"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
        <button
          onClick={() => exportToCSV(expenses)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={expenses.length}
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <p className="text-gray-500 font-medium">No expenses match your filters</p>
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
