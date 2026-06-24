import { Category, CategoryMeta } from './types';

export const CATEGORIES: CategoryMeta[] = [
  {
    label: 'Food',
    color: '#f97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: '🍔',
  },
  {
    label: 'Transportation',
    color: '#3b82f6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '🚗',
  },
  {
    label: 'Entertainment',
    color: '#a855f7',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: '🎬',
  },
  {
    label: 'Shopping',
    color: '#ec4899',
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-700',
    icon: '🛍️',
  },
  {
    label: 'Bills',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '📄',
  },
  {
    label: 'Other',
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    icon: '📦',
  },
];

export const CATEGORY_NAMES: Category[] = CATEGORIES.map((c) => c.label);

export function getCategoryMeta(category: Category): CategoryMeta {
  return CATEGORIES.find((c) => c.label === category) ?? CATEGORIES[5];
}
