import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '@/components/ui/Badge';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/types';

describe('CategoryBadge', () => {
  it('renders the category name as text', () => {
    render(<CategoryBadge category="Food" />);
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('renders the icon for Food', () => {
    render(<CategoryBadge category="Food" />);
    expect(screen.getByText('🍔')).toBeInTheDocument();
  });

  it('renders the icon for Transportation', () => {
    render(<CategoryBadge category="Transportation" />);
    expect(screen.getByText('🚗')).toBeInTheDocument();
  });

  it('renders the icon for Entertainment', () => {
    render(<CategoryBadge category="Entertainment" />);
    expect(screen.getByText('🎬')).toBeInTheDocument();
  });

  it('renders the icon for Shopping', () => {
    render(<CategoryBadge category="Shopping" />);
    expect(screen.getByText('🛍️')).toBeInTheDocument();
  });

  it('renders the icon for Bills', () => {
    render(<CategoryBadge category="Bills" />);
    expect(screen.getByText('📄')).toBeInTheDocument();
  });

  it('renders the icon for Other', () => {
    render(<CategoryBadge category="Other" />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('applies the correct background color class for each category', () => {
    for (const cat of CATEGORIES) {
      const { container, unmount } = render(<CategoryBadge category={cat.label as Category} />);
      const badge = container.firstChild as HTMLElement;
      expect(badge.className).toContain(cat.bgColor);
      expect(badge.className).toContain(cat.textColor);
      unmount();
    }
  });

  it('renders a span element as the root', () => {
    const { container } = render(<CategoryBadge category="Bills" />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });
});
