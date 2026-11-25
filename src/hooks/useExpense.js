import { useCallback } from 'react';
import * as expensesApi from '../api/expenses.js';
import { useApiData } from './useApiData.js';
import { useAppData } from './useAppData.js';

/** notFound: the id doesn't exist (a bad link, or deleted already). */
export function useExpense(id) {
  const { version, notifyChange } = useAppData();
  const { data, status, error, reload } = useApiData((options) => expensesApi.getExpense(id, options), [id, version], {
    keepPrevious: true, // no skeleton flash after saving an edit
  });

  const updateExpense = useCallback(
    async (input) => {
      const expense = await expensesApi.updateExpense(id, input);
      notifyChange();
      return expense;
    },
    [id, notifyChange],
  );

  // `leavePage` runs before the refresh; otherwise this page would reload and flash "not found".
  const deleteExpense = useCallback(
    async (leavePage) => {
      await expensesApi.deleteExpense(id);
      leavePage();
      notifyChange();
    },
    [id, notifyChange],
  );

  const restoreExpense = useCallback(
    async (expense) => {
      await expensesApi.restoreExpense(expense);
      notifyChange();
    },
    [notifyChange],
  );

  const notFound = status === 'error' && (error?.status === 404 || error?.status === 400);

  return { expense: data, status, error, notFound, reload, updateExpense, deleteExpense, restoreExpense };
}
