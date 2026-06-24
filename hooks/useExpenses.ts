'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, Category } from '@/lib/types';
import { generateId, getTodayISO } from '@/lib/utils';

const STORAGE_KEY = 'expense-tracker-data';

function loadFromStorage(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadFromStorage());
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Expense[]) => {
    setExpenses(next);
    saveToStorage(next);
  }, []);

  const addExpense = useCallback(
    (data: { amount: number; category: Category; description: string; date: string }) => {
      const expense: Expense = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      persist([expense, ...expenses]);
      return expense;
    },
    [expenses, persist]
  );

  const updateExpense = useCallback(
    (id: string, data: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
      persist(expenses.map((e) => (e.id === id ? { ...e, ...data } : e)));
    },
    [expenses, persist]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      persist(expenses.filter((e) => e.id !== id));
    },
    [expenses, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { expenses, loaded, addExpense, updateExpense, deleteExpense, clearAll };
}

export type UseExpensesReturn = ReturnType<typeof useExpenses>;
