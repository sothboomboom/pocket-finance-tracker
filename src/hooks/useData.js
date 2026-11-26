import { useCallback, useMemo } from 'react';
import * as store from '../store/expenses.js';
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
export function useExpenses({ from, to, categoryId = null, paymentMethod = null }) {
  // `version` changes after any edit anywhere, which reads the list again.
  const { version, notifyChange } = useAppData();
  const expenses = useMemo(
    () => store.listExpenses({ from, to, categoryId, paymentMethod }),
    [from, to, categoryId, paymentMethod, version],
  );

  const createExpense = useCallback(
    (values) => {
      const expense = store.createExpense(values);
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
    (values) => {
      store.updateExpense(id, values);
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

  return { expense, updateExpense, deleteExpense };
}
