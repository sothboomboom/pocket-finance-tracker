import { useMemo } from 'react';
import * as store from '../store/expenses.js';
import { useAppData } from '../context/DataContext.js';

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
/** Expenses in a date range, with optional filters. Deleting lives in useExpense */
export function useExpenses({ from, to, categoryId = null, paymentMethod = null }) {
  // `version` changes after any edit anywhere, which reads the list again.
  const { version, notifyChange } = useAppData();
  const expenses = useMemo(
    () => store.listExpenses({ from, to, categoryId, paymentMethod }),
    [from, to, categoryId, paymentMethod, version],
  );

  function createExpense(values) {
    const expense = store.createExpense(values);
    notifyChange();
    return expense;
  }

  return { expenses, createExpense };
}

//////////////////////////////
// useExpense
//////////////////////////////
/** expense is null when the id doesn't exist (a bad link, or deleted already) */
export function useExpense(id) {
  const { version, notifyChange } = useAppData();
  const expense = useMemo(() => store.getExpense(id), [id, version]);

  function updateExpense(values) {
    store.updateExpense(id, values);
    notifyChange();
  }

  // `leavePage` runs before the update; otherwise this page would show "not found" for a moment.
  function deleteExpense(leavePage) {
    store.deleteExpense(id);
    leavePage();
    notifyChange();
  }

  return { expense, updateExpense, deleteExpense };
}
