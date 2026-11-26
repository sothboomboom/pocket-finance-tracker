import { useCallback } from 'react';
import * as expensesApi from '../api/expenses.js';
import { getRates } from '../api/rates.js';
import { useAppData } from '../context/DataContext.js';
import { useApiData } from './useApiData.js';

// The data hooks every page uses. Categories are shared through DataContext;
// expenses and rates load with useApiData and reload when `version` changes.

//////////////////////////////
// useCategories
//////////////////////////////
/** Categories come from DataContext, so every page shares one copy. */
export function useCategories() {
  const {
    categories,
    categoriesStatus,
    categoriesError,
    reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAppData();

  return {
    categories,
    status: categoriesStatus,
    error: categoriesError,
    reload: reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

//////////////////////////////
// useExpenses
//////////////////////////////
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

//////////////////////////////
// useExpense
//////////////////////////////
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

//////////////////////////////
// useRates
//////////////////////////////
/** Rates as "1 unit = X USD", refreshed at most once a day. */
export function useRates() {
  const { data, status, error, reload } = useApiData((options) => getRates(options), []);
  return {
    rates: data?.rates ?? null,
    updatedAt: data?.updatedAt ?? null,
    source: data?.source ?? null,
    status,
    error,
    reload,
  };
}
