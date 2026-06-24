'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Expense } from '@/lib/types';
import { getSpendingByCategory, formatCurrency, getTotalSpending } from '@/lib/utils';

interface CategoryBreakdownProps {
  expenses: Expense[];
}

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { color: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
      <p className="font-medium text-gray-900">{payload[0].name}</p>
      <p className="font-semibold mt-0.5" style={{ color: payload[0].payload.color }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const data = getSpendingByCategory(expenses);
  const total = getTotalSpending(expenses);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Spending by Category</h3>
      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-400">
          No spending data yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 space-y-2">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-700">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs">
                    {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
                  </span>
                  <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
