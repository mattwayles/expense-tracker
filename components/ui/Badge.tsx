'use client';

import { getCategoryMeta } from '@/lib/categories';
import { Category } from '@/lib/types';

export function CategoryBadge({ category }: { category: Category }) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.bgColor} ${meta.textColor}`}
    >
      <span>{meta.icon}</span>
      {category}
    </span>
  );
}
