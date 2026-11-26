import { useCallback, useEffect, useMemo, useState } from 'react';
import * as store from '../store/expenses.js';
import { getRates } from '../store/rates.js';
import { useAppData } from '../context/DataContext.js';

// The data hooks every page uses. Categories are shared through DataContext;
// expenses are read from the store again whenever `version` changes.

//////////////////////////////
// useCategories
//////////////////////////////
export function useCategories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useAppData();
  return { categories, createCategory, updateCategory, deleteCategory };
}

//////////////////////////////
// useExpenses
//////////////////////////////
/** Expenses in a date range, with optional filters. Deleting lives in useExpense. */
export function useExpenses({ from, to, categoryId = null, paymentMethod = null, q = '' }) {
  // `version` changes after any edit anywhere, which reads the list again.
  const { version, notifyChange } = useAppData();
  const expenses = useMemo(
    () => store.listExpenses({ from, to, categoryId, paymentMethod, q }),
    [from, to, categoryId, paymentMethod, q, version],
  );

  const createExpense = useCallback(
    async (values) => {
      const expense = await store.createExpense(values);
      notifyChange();
      return expense;
    },
    [notifyChange],
  );

  return { expenses, createExpense };
}

//////////////////////////////
// useExpense
//////////////////////////////
/** expense is null when the id doesn't exist (a bad link, or deleted already). */
export function useExpense(id) {
  const { version, notifyChange } = useAppData();
  const expense = useMemo(() => store.getExpense(id), [id, version]);

  const updateExpense = useCallback(
    async (values) => {
      await store.updateExpense(id, values);
      notifyChange();
    },
    [id, notifyChange],
  );

  // `leavePage` runs before the update; otherwise this page would show "not found" for a moment.
  const deleteExpense = useCallback(
    (leavePage) => {
      store.deleteExpense(id);
      leavePage();
      notifyChange();
    },
    [id, notifyChange],
  );

  const restoreExpense = useCallback(
    (deleted) => {
      store.restoreExpense(deleted);
      notifyChange();
    },
    [notifyChange],
  );

  return { expense, updateExpense, deleteExpense, restoreExpense };
}

//////////////////////////////
// useRates
//////////////////////////////
/** Rates as "1 unit = X USD". They come from the internet, so they take a moment the first time. */
export function useRates() {
  const [data, setData] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false; // a newer load replaced this one, or the page closed
    getRates().then((result) => {
      if (!ignore) setData(result);
    });
    return () => {
      ignore = true;
    };
  }, [attempt]);

  // Old rates stay on screen while new ones load.
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    rates: data?.rates ?? null,
    updatedAt: data?.updatedAt ?? null,
    source: data?.source ?? null,
    status: data ? 'success' : 'loading',
    reload,
  };
}
