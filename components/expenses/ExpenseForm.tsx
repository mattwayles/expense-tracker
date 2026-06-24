'use client';

import { useState, useEffect } from 'react';
import { Category, Expense } from '@/lib/types';
import { CATEGORY_NAMES } from '@/lib/categories';
import { getTodayISO } from '@/lib/utils';

interface FormData {
  amount: string;
  category: Category;
  description: string;
  date: string;
}

interface FormErrors {
  amount?: string;
  category?: string;
  description?: string;
  date?: string;
}

interface ExpenseFormProps {
  onSubmit: (data: { amount: number; category: Category; description: string; date: string }) => void;
  onCancel?: () => void;
  initialData?: Expense;
  submitLabel?: string;
}

export function ExpenseForm({ onSubmit, onCancel, initialData, submitLabel = 'Add Expense' }: ExpenseFormProps) {
  const [form, setForm] = useState<FormData>({
    amount: initialData ? String(initialData.amount) : '',
    category: initialData?.category ?? 'Food',
    description: initialData?.description ?? '',
    date: initialData?.date ?? getTodayISO(),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        amount: String(initialData.amount),
        category: initialData.category,
        description: initialData.description,
        date: initialData.date,
      });
    }
  }, [initialData]);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    } else if (amount > 1_000_000) {
      newErrors.amount = 'Amount cannot exceed $1,000,000';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (form.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }
    if (!form.date) {
      newErrors.date = 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      onSubmit({
        amount: Math.round(parseFloat(form.amount) * 100) / 100,
        category: form.category,
        description: form.description.trim(),
        date: form.date,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name: keyof FormData) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [name]: e.target.value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            className={`w-full rounded-xl border pl-7 pr-4 py-3 text-sm outline-none transition-all ${
              errors.amount
                ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
            }`}
            {...field('amount')}
          />
        </div>
        {errors.amount && <p className="mt-1.5 text-xs text-red-500">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
        <select
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          {...field('category')}
        >
          {CATEGORY_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <input
          type="text"
          placeholder="What did you spend on?"
          maxLength={200}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
            errors.description
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
          }`}
          {...field('description')}
        />
        {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>}
        <p className="mt-1 text-right text-xs text-gray-400">{form.description.length}/200</p>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
        <input
          type="date"
          max={getTodayISO()}
          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
            errors.date
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white'
          }`}
          {...field('date')}
        />
        {errors.date && <p className="mt-1.5 text-xs text-red-500">{errors.date}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm shadow-indigo-200"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
