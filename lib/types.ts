export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string; // ISO timestamp
}

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
}

export interface CategoryMeta {
  label: Category;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}
