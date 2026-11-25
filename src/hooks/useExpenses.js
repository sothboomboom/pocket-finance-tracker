import { useCallback } from 'react';
import * as expensesApi from '../api/expenses.js';
import { useApiData } from './useApiData.js';
import { useAppData } from './useAppData.js';

/** Expenses in a date range, with optional filters. Deleting lives in useExpense. */
export function useExpenses({ from, to, categoryId = null, paymentMethod = null, q = '' }) {
  // `version` changes after any edit anywhere, which reloads this list.
  const { version, notifyChange } = useAppData();

  const { data, status, error, reload, isRefreshing } = useApiData(
    (options) => expensesApi.listExpenses({ from, to, categoryId, paymentMethod, q }, options),
    [from, to, categoryId, paymentMethod, q, version],
    { keepPrevious: true },
  );

  const createExpense = useCallback(
    async (input) => {
      const expense = await expensesApi.createExpense(input);
      notifyChange();
      return expense;
    },
    [notifyChange],
  );

  return { expenses: data ?? [], status, error, reload, isRefreshing, createExpense };
}
