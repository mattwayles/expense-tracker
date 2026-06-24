'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ExpenseFilters, Category } from '@/lib/types';
import { CATEGORY_NAMES } from '@/lib/categories';

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function FilterBar({ filters, onChange, resultCount, totalCount }: FilterBarProps) {
  const hasActiveFilters =
    filters.search || filters.category !== 'All' || filters.dateFrom || filters.dateTo;

  function clear() {
    onChange({ search: '', category: 'All', dateFrom: '', dateTo: '' });
  }

  function set<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          />
        </div>

        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) => set('category', e.target.value as Category | 'All')}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
        >
          <option value="All">All Categories</option>
          {CATEGORY_NAMES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Date From */}
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => set('dateFrom', e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          placeholder="From"
        />

        {/* Date To */}
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => set('dateTo', e.target.value)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
          placeholder="To"
        />
      </div>

      {totalCount > 0 && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-medium text-gray-600">{resultCount}</span> of{' '}
          <span className="font-medium text-gray-600">{totalCount}</span> expenses
        </p>
      )}
    </div>
  );
}
