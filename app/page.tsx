'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { RecentExpenses } from '@/components/dashboard/RecentExpenses';

export default function DashboardPage() {
  const { expenses, loaded } = useExpenses();

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your spending</p>
        </div>
        <Link
          href="/add"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Link>
      </div>

      {/* Summary cards */}
      <SummaryCards expenses={expenses} />

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SpendingChart expenses={expenses} />
        </div>
        <div className="lg:col-span-2">
          <CategoryBreakdown expenses={expenses} />
        </div>
      </div>

      {/* Recent expenses */}
      <RecentExpenses expenses={expenses} />
    </div>
  );
}
