import { describe, it, expect } from 'vitest';
import { CATEGORIES, CATEGORY_NAMES, getCategoryMeta } from '@/lib/categories';
import type { Category } from '@/lib/types';

describe('CATEGORIES', () => {
  it('contains exactly 6 categories', () => {
    expect(CATEGORIES).toHaveLength(6);
  });

  it('every category has a label, color, bgColor, textColor, and icon', () => {
    for (const cat of CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(cat.bgColor).toMatch(/^bg-/);
      expect(cat.textColor).toMatch(/^text-/);
      expect(cat.icon).toBeTruthy();
    }
  });

  it('contains all six expected category labels', () => {
    const labels = CATEGORIES.map((c) => c.label);
    expect(labels).toContain('Food');
    expect(labels).toContain('Transportation');
    expect(labels).toContain('Entertainment');
    expect(labels).toContain('Shopping');
    expect(labels).toContain('Bills');
    expect(labels).toContain('Other');
  });
});

describe('CATEGORY_NAMES', () => {
  it('has the same length as CATEGORIES', () => {
    expect(CATEGORY_NAMES).toHaveLength(CATEGORIES.length);
  });

  it('matches the label of each CATEGORY in order', () => {
    expect(CATEGORY_NAMES).toEqual(CATEGORIES.map((c) => c.label));
  });
});

describe('getCategoryMeta', () => {
  it('returns the correct meta for Food', () => {
    const meta = getCategoryMeta('Food');
    expect(meta.label).toBe('Food');
    expect(meta.color).toBe('#f97316');
    expect(meta.icon).toBe('🍔');
  });

  it('returns the correct meta for Transportation', () => {
    const meta = getCategoryMeta('Transportation');
    expect(meta.label).toBe('Transportation');
    expect(meta.color).toBe('#3b82f6');
  });

  it('returns the correct meta for Entertainment', () => {
    const meta = getCategoryMeta('Entertainment');
    expect(meta.label).toBe('Entertainment');
    expect(meta.color).toBe('#a855f7');
  });

  it('returns the correct meta for Shopping', () => {
    const meta = getCategoryMeta('Shopping');
    expect(meta.label).toBe('Shopping');
    expect(meta.color).toBe('#ec4899');
  });

  it('returns the correct meta for Bills', () => {
    const meta = getCategoryMeta('Bills');
    expect(meta.label).toBe('Bills');
    expect(meta.color).toBe('#ef4444');
  });

  it('returns the correct meta for Other', () => {
    const meta = getCategoryMeta('Other');
    expect(meta.label).toBe('Other');
    expect(meta.color).toBe('#6b7280');
  });

  it('falls back to the Other category for an unknown value', () => {
    // Type-cast to simulate a runtime value not in the union
    const meta = getCategoryMeta('Unknown' as Category);
    expect(meta).toEqual(CATEGORIES[5]);
    expect(meta.label).toBe('Other');
  });
});
