'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate, sortByDateDesc } from '@/lib/utils';
import { CategoryBadge } from '@/components/ui/Badge';

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recent = sortByDateDesc(expenses).slice(0, 5);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Expenses</h3>
        {expenses.length > 5 && (
          <Link
            href="/expenses"
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-gray-400">
          No expenses yet
        </div>
      ) : (
        <div className="space-y-3">
          {recent.map((expense) => (
            <div key={expense.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <CategoryBadge category={expense.category} />
                  <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold text-gray-900">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
