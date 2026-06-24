'use client';

import { TrendingUp, Calendar, Tag, Receipt } from 'lucide-react';
import { Expense } from '@/lib/types';
import {
  formatCurrency,
  getTotalSpending,
  getMonthlyTotal,
  getTopCategory,
  getCurrentMonthLabel,
} from '@/lib/utils';

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const total = getTotalSpending(expenses);
  const monthly = getMonthlyTotal(expenses);
  const top = getTopCategory(expenses);
  const count = expenses.length;

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(total),
      sub: `${count} expense${count !== 1 ? 's' : ''} recorded`,
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-white/20',
    },
    {
      title: getCurrentMonthLabel(),
      value: formatCurrency(monthly),
      sub: 'This month',
      icon: Calendar,
      gradient: 'from-violet-500 to-violet-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Top Category',
      value: top ? top.category : '—',
      sub: top ? formatCurrency(top.amount) + ' total' : 'No expenses yet',
      icon: Tag,
      gradient: 'from-sky-500 to-sky-600',
      iconBg: 'bg-white/20',
    },
    {
      title: 'Transactions',
      value: count.toString(),
      sub: 'All time',
      icon: Receipt,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 uppercase tracking-wide">{card.title}</p>
                <p className="mt-1.5 text-2xl font-bold">{card.value}</p>
                <p className="mt-0.5 text-xs text-white/60">{card.sub}</p>
              </div>
              <div className={`rounded-xl ${card.iconBg} p-2`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
          </div>
        );
      })}
    </div>
  );
}
