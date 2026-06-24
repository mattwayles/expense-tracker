'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Expense } from '@/lib/types';
import { getMonthlyTrend } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

interface SpendingChartProps {
  expenses: Expense[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-900">{label}</p>
      <p className="text-indigo-600 font-semibold mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function SpendingChart({ expenses }: SpendingChartProps) {
  const data = getMonthlyTrend(expenses);
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
      {maxAmount <= 1 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          No spending data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={index === data.length - 1 ? '#6366f1' : '#c7d2fe'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
