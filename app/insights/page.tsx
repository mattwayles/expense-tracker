'use client';

import { useExpenses } from '@/hooks/useExpenses';
import { MonthlyInsights } from '@/components/dashboard/MonthlyInsights';

export default function InsightsPage() {
  const { expenses, loaded } = useExpenses();

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your monthly spending breakdown</p>
      </div>
      <MonthlyInsights expenses={expenses} />
    </div>
  );
}
