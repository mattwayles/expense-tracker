'use client';

import { useState } from 'react';
import { Expense } from '@/lib/types';
import {
  formatCurrency,
  getSpendingByCategory,
  getBudgetStreak,
  getCurrentMonthExpenses,
  getCurrentMonthLabel,
} from '@/lib/utils';
import { getCategoryMeta } from '@/lib/categories';
import { Flame } from 'lucide-react';

interface MonthlyInsightsProps {
  expenses: Expense[];
}

// ── SVG donut helpers ────────────────────────────────────────────────────────

function toXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number,
): string {
  const os = toXY(cx, cy, outerR, startDeg);
  const oe = toXY(cx, cy, outerR, endDeg);
  const is_ = toXY(cx, cy, innerR, startDeg);
  const ie = toXY(cx, cy, innerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${os.x.toFixed(3)} ${os.y.toFixed(3)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x.toFixed(3)} ${oe.y.toFixed(3)}`,
    `L ${ie.x.toFixed(3)} ${ie.y.toFixed(3)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is_.x.toFixed(3)} ${is_.y.toFixed(3)}`,
    'Z',
  ].join(' ');
}

// ── Donut component ──────────────────────────────────────────────────────────

const CX = 104;
const CY = 104;
const OUTER_R = 90;
const INNER_R = 56;
const GAP_DEG = 2;

interface Segment {
  name: string;
  value: number;
  color: string;
  startDeg: number;
  endDeg: number;
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const [hovered, setHovered] = useState<Segment | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);

  // Build segments with a small gap between each slice
  const segments: Segment[] = [];
  let cursor = 0;
  for (const d of data) {
    const sweep = (d.value / total) * 360;
    const start = cursor + GAP_DEG / 2;
    const end = cursor + sweep - GAP_DEG / 2;
    if (end > start) {
      segments.push({ ...d, startDeg: start, endDeg: end });
    }
    cursor += sweep;
  }

  return (
    <div className="relative" style={{ width: 208, height: 208 }}>
      <svg width={208} height={208} viewBox="0 0 208 208">
        {segments.map((seg) => (
          <path
            key={seg.name}
            d={segmentPath(CX, CY, INNER_R, OUTER_R, seg.startDeg, seg.endDeg)}
            fill={seg.color}
            opacity={hovered && hovered.name !== seg.name ? 0.45 : 1}
            style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
            onMouseEnter={() => setHovered(seg)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </svg>

      {/* Centre label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        {hovered ? (
          <>
            <span className="text-xs font-medium text-gray-500 leading-tight">{hovered.name}</span>
            <span className="text-sm font-bold text-gray-900 leading-tight mt-0.5">
              {formatCurrency(hovered.value)}
            </span>
          </>
        ) : (
          <span className="text-xs font-medium text-gray-400">Spending</span>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function MonthlyInsights({ expenses }: MonthlyInsightsProps) {
  const monthExpenses = getCurrentMonthExpenses(expenses);
  const categoryData = getSpendingByCategory(monthExpenses);
  const top3 = categoryData.slice(0, 3);
  const streak = getBudgetStreak(expenses);
  const monthLabel = getCurrentMonthLabel();

  return (
    <div className="mx-auto max-w-sm w-full">
      <div className="rounded-3xl border border-gray-100 bg-white shadow-md px-6 pt-7 pb-8 space-y-7">

        {/* Title */}
        <div className="text-center space-y-1">
          <h2
            className="text-2xl font-bold tracking-tight text-gray-900"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Monthly Insights
          </h2>
          {/* Dashed line mimicking the napkin squiggle */}
          <div className="flex items-center justify-center gap-0.5 pt-0.5">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="block h-px w-2 rounded-full bg-gray-300" />
            ))}
          </div>
          <p className="text-xs text-gray-400 pt-0.5">{monthLabel}</p>
        </div>

        {/* Donut */}
        <div className="flex justify-center">
          {categoryData.length > 0 ? (
            <DonutChart data={categoryData} />
          ) : (
            <div
              className="flex items-center justify-center rounded-full border-4 border-dashed border-gray-200"
              style={{ width: 208, height: 208 }}
            >
              <span className="text-sm text-gray-400">No data yet</span>
            </div>
          )}
        </div>

        {/* Top 3 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Top Categories
            </span>
            <span className="text-xs font-medium text-indigo-400">Top 3!</span>
          </div>

          {top3.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-2">No expenses this month</p>
          ) : (
            <div className="space-y-2.5">
              {top3.map((item) => {
                const meta = getCategoryMeta(item.name as Parameters<typeof getCategoryMeta>[0]);
                return (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-1 h-7 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-base leading-none">{meta.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Streak */}
        <div className="rounded-2xl border-2 border-dashed border-gray-200 px-5 py-4">
          <p className="text-sm font-semibold text-gray-700 text-center mb-3">Budget Streak</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-0.5">
              <span
                className="text-5xl font-extrabold leading-none tabular-nums"
                style={{ color: streak > 0 ? '#22c55e' : '#d1d5db' }}
              >
                {streak}
              </span>
              <span className="text-sm font-medium text-gray-500">days!</span>
            </div>
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                streak > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Flame className="h-4 w-4" />
              {streak > 0 ? 'Active' : 'Start!'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
