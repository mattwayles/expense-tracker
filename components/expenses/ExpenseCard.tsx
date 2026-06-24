'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Expense } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CategoryBadge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/Modal';
import { Modal } from '@/components/ui/Modal';
import { ExpenseForm } from './ExpenseForm';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
}

export function ExpenseCard({ expense, onDelete, onUpdate }: ExpenseCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <div className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-gray-900 truncate">{expense.description}</p>
            <span className="shrink-0 text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <CategoryBadge category={expense.category} />
            <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => onDelete(expense.id)}
        title="Delete Expense"
        description={`Are you sure you want to delete "${expense.description}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Expense">
        <ExpenseForm
          initialData={expense}
          submitLabel="Save Changes"
          onCancel={() => setShowEdit(false)}
          onSubmit={(data) => {
            onUpdate(expense.id, data);
            setShowEdit(false);
          }}
        />
      </Modal>
    </>
  );
}
