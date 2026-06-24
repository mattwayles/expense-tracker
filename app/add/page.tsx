'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function AddExpensePage() {
  const router = useRouter();
  const { addExpense } = useExpenses();
  const [success, setSuccess] = useState<{ description: string; amount: number } | null>(null);

  function handleSubmit(data: { amount: number; category: Category; description: string; date: string }) {
    addExpense(data);
    setSuccess({ description: data.description, amount: data.amount });
    setTimeout(() => {
      setSuccess(null);
      router.push('/expenses');
    }, 1500);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Expense Added!</h2>
          <p className="mt-1 text-sm text-gray-500">
            {success.description} — {formatCurrency(success.amount)}
          </p>
          <p className="mt-2 text-xs text-gray-400">Redirecting to expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-sm text-gray-500 mt-0.5">Record a new expense</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Add Expense"
        />
      </div>
    </div>
  );
}
