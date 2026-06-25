import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExpenses } from '@/hooks/useExpenses';

// Node.js v22+ has an experimental (undefined-without-a-file) built-in localStorage that
// prevents jsdom from overriding it. Provide a real in-memory implementation instead.
function makeLocalStorage() {
  const data: Record<string, string> = {};
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = value; },
    removeItem: (key: string) => { delete data[key]; },
    clear: () => { Object.keys(data).forEach((k) => delete data[k]); },
    get length() { return Object.keys(data).length; },
    key: (i: number) => Object.keys(data)[i] ?? null,
  };
}

let mockStorage: ReturnType<typeof makeLocalStorage>;

beforeAll(() => {
  mockStorage = makeLocalStorage();
  vi.stubGlobal('localStorage', mockStorage);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const STORAGE_KEY = 'expense-tracker-data';

function seedStorage(expenses: object[]) {
  mockStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

const SAMPLE_EXPENSE = {
  id: 'existing-1',
  amount: 25.0,
  category: 'Food' as const,
  description: 'Lunch',
  date: '2026-06-20',
  createdAt: '2026-06-20T12:00:00.000Z',
};

describe('useExpenses', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('exposes loaded=true after initial render and effect flush', () => {
    // React 19 + Testing Library: renderHook wraps in act(), which flushes effects
    // synchronously, so loaded is already true by the time result.current is read.
    const { result } = renderHook(() => useExpenses());
    expect(result.current.loaded).toBe(true);
  });

  it('sets loaded=true after hydration from localStorage', async () => {
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));
  });

  it('starts with an empty array when localStorage is empty', async () => {
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.expenses).toEqual([]);
  });

  it('loads existing expenses from localStorage on mount', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].id).toBe('existing-1');
  });

  it('handles corrupt localStorage data gracefully and starts with empty array', async () => {
    mockStorage.setItem(STORAGE_KEY, 'NOT_VALID_JSON');
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));
    expect(result.current.expenses).toEqual([]);
  });

  it('addExpense prepends the new expense to state', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addExpense({
        amount: 9.99,
        category: 'Entertainment',
        description: 'Spotify',
        date: '2026-06-24',
      });
    });

    expect(result.current.expenses).toHaveLength(2);
    expect(result.current.expenses[0].description).toBe('Spotify');
    expect(result.current.expenses[0].amount).toBe(9.99);
  });

  it('addExpense assigns a generated id and createdAt timestamp', async () => {
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    let returned: ReturnType<typeof result.current.addExpense>;
    act(() => {
      returned = result.current.addExpense({
        amount: 5,
        category: 'Other',
        description: 'Test',
        date: '2026-06-24',
      });
    });

    expect(returned!.id).toBeTruthy();
    expect(returned!.createdAt).toBeTruthy();
    expect(new Date(returned!.createdAt).getTime()).toBeGreaterThan(0);
  });

  it('addExpense persists the updated list to localStorage', async () => {
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.addExpense({
        amount: 20,
        category: 'Bills',
        description: 'Electric',
        date: '2026-06-24',
      });
    });

    const stored = JSON.parse(mockStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].description).toBe('Electric');
  });

  it('updateExpense modifies the matching expense and leaves others untouched', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.updateExpense('existing-1', { description: 'Dinner', amount: 40 });
    });

    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].description).toBe('Dinner');
    expect(result.current.expenses[0].amount).toBe(40);
    expect(result.current.expenses[0].id).toBe('existing-1');
    expect(result.current.expenses[0].category).toBe('Food');
  });

  it('updateExpense with an unknown id leaves the list unchanged', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.updateExpense('does-not-exist', { amount: 999 });
    });

    expect(result.current.expenses[0].amount).toBe(25.0);
  });

  it('deleteExpense removes the expense with the given id', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.deleteExpense('existing-1');
    });

    expect(result.current.expenses).toHaveLength(0);
  });

  it('deleteExpense persists the removal to localStorage', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.deleteExpense('existing-1');
    });

    const stored = JSON.parse(mockStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(0);
  });

  it('deleteExpense with an unknown id does not remove any expense', async () => {
    seedStorage([SAMPLE_EXPENSE]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.deleteExpense('no-such-id');
    });

    expect(result.current.expenses).toHaveLength(1);
  });

  it('clearAll removes all expenses and persists the empty state', async () => {
    seedStorage([SAMPLE_EXPENSE, { ...SAMPLE_EXPENSE, id: 'existing-2' }]);
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.expenses).toHaveLength(0);
    const stored = JSON.parse(mockStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(0);
  });
});
