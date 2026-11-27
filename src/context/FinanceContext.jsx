// All the app's data in one place: categories, expenses and the last currency used.
// Saved in localStorage, so it's still there after the browser closes.
import { useEffect, useMemo, useState } from 'react';
import { FinanceContext } from './useFinance.js';
import { emptyData, sampleData, FALLBACK_CATEGORY_NAME } from '../data/sampleData.js';
import { CATEGORY_ICON_OPTIONS, CATEGORY_NAME_MAX_LENGTH, NOTE_MAX_LENGTH } from '../data/categories.js';
import { CURRENCIES, BASE_CURRENCY, RATES_TO_USD } from '../data/currencies.js';
import { convertToUsd } from '../utils/money.js';

// Bump the version if the saved shape changes, so old data isn't misread.
const DATA_KEY = 'pocket:data:v1';
const CURRENCY_KEY = 'pocket:lastCurrency';

// Load and save
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(DATA_KEY));
    if (Array.isArray(saved?.categories) && Array.isArray(saved?.expenses)) return saved;
  } catch {
    // Blocked storage or broken JSON: start empty.
  }
  return emptyData();
}

function loadCurrency() {
  try {
    const code = localStorage.getItem(CURRENCY_KEY);
    return CURRENCIES[code] ? code : BASE_CURRENCY;
  } catch {
    return BASE_CURRENCY;
  }
}

function saveItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked: keep working, just without remembering.
  }
}

// Checking form values
/** An error that carries one message per form field, e.g. { name: 'Enter a name' }. */
function formError(fieldErrors) {
  const error = new Error('Please fix the highlighted fields');
  error.fieldErrors = fieldErrors;
  return error;
}

/** Returns clean values, or throws an error with a message per field. */
function checkExpense(values, categories) {
  const errors = {};
  const currency = CURRENCIES[values.currency] ? values.currency : null;
  if (!currency) errors.currency = 'This currency is not supported';

  const text = String(values.amount ?? '').trim();
  const amount = Number(text);
  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  const pattern = decimals > 0 ? /^\d+(\.\d{1,2})?$/ : /^\d+$/;
  if (!(amount > 0)) errors.amount = 'Amount must be more than 0';
  else if (!pattern.test(text)) {
    errors.amount = decimals === 0 ? 'Enter a whole number amount' : 'Enter an amount with up to 2 decimals';
  }

  if (!categories.some((c) => c.id === Number(values.categoryId))) errors.categoryId = 'Choose a category';
  if (!['cash', 'bank'].includes(values.paymentMethod)) errors.paymentMethod = 'Choose Cash or Bank';
  if (!values.spentAt) errors.spentAt = 'Choose a date';

  const note = values.note?.trim() || null;
  if (note && note.length > NOTE_MAX_LENGTH) errors.note = `Keep the note under ${NOTE_MAX_LENGTH} characters`;

  if (Object.keys(errors).length > 0) throw formError(errors);
  const { categoryId, paymentMethod, spentAt } = values;
  return { amount, currency, categoryId: Number(categoryId), paymentMethod, spentAt, note };
}

function checkCategory(values, categories, ownId = null) {
  const errors = {};
  const name = (values.name ?? '').trim().replace(/\s+/g, ' ');
  if (!name) errors.name = 'Enter a name';
  else if (name.length > CATEGORY_NAME_MAX_LENGTH) errors.name = `Keep the name under ${CATEGORY_NAME_MAX_LENGTH} characters`;
  // Case-insensitive, so "food" can't sit next to "Food".
  else if (categories.some((c) => c.id !== ownId && c.name.toLowerCase() === name.toLowerCase())) {
    errors.name = 'You already have a category with this name';
  }
  if (!CATEGORY_ICON_OPTIONS.some((o) => o.name === values.icon)) errors.icon = 'Choose an icon';
  if (Object.keys(errors).length > 0) throw formError(errors);
  return { name, icon: values.icon };
}

const isFallback = (category) => category.name === FALLBACK_CATEGORY_NAME;

// Newest first; ties broken by time recorded, then id, so the order never jumps.
function newestFirst(a, b) {
  return b.spentAt.localeCompare(a.spentAt) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
}

export function FinanceProvider({ children }) {
  // { categories, expenses, nextCategoryId, nextExpenseId }
  const [data, setData] = useState(loadData);
  const [lastCurrency, setLastCurrencyState] = useState(loadCurrency);

  useEffect(() => saveItem(DATA_KEY, JSON.stringify(data)), [data]);

  // Each category with how many expenses use it. "Other" always goes last.
  const categories = useMemo(
    () =>
      [...data.categories]
        .sort((a, b) => isFallback(a) - isFallback(b) || a.id - b.id)
        .map((c) => ({
          ...c,
          expenseCount: data.expenses.filter((e) => e.categoryId === c.id).length,
          isFallback: isFallback(c),
        })),
    [data],
  );

  // Every expense, newest first, with its whole category instead of just categoryId.
  const expenses = useMemo(
    () =>
      [...data.expenses].sort(newestFirst).map(({ categoryId, ...rest }) => {
        const { id, name, icon } = data.categories.find((c) => c.id === categoryId);
        return { ...rest, category: { id, name, icon } };
      }),
    [data],
  );

  // Reading expenses
  /** Every filter is optional. from/to are 'YYYY-MM-DD' and inclusive. */
  function listExpenses({ from = null, to = null, categoryId = null, paymentMethod = null } = {}) {
    return expenses.filter(
      (e) =>
        (!from || e.spentAt >= from) &&
        (!to || e.spentAt <= to) &&
        (!categoryId || e.category.id === categoryId) &&
        (!paymentMethod || e.paymentMethod === paymentMethod),
    );
  }

  /** null when there is no expense with this id (a bad link, or deleted). */
  function getExpense(id) {
    return expenses.find((e) => e.id === Number(id)) ?? null;
  }

  // Changing expenses
  function createExpense(values) {
    const clean = checkExpense(values, data.categories);
    const rateToUsd = RATES_TO_USD[clean.currency];
    const now = new Date().toISOString();
    const expense = {
      id: data.nextExpenseId,
      ...clean,
      rateToUsd,
      amountUsd: convertToUsd(clean.amount, rateToUsd),
      createdAt: now,
      updatedAt: now,
    };
    setData({ ...data, expenses: [...data.expenses, expense], nextExpenseId: data.nextExpenseId + 1 });
  }

  function updateExpense(id, values) {
    const clean = checkExpense(values, data.categories);
    const expenses = data.expenses.map((expense) => {
      if (expense.id !== Number(id)) return expense;
      // Keep the saved rate unless the currency changed, so editing a note never changes past totals.
      const rateToUsd = expense.currency === clean.currency ? expense.rateToUsd : RATES_TO_USD[clean.currency];
      return {
        ...expense,
        ...clean,
        rateToUsd,
        amountUsd: convertToUsd(clean.amount, rateToUsd),
        updatedAt: new Date().toISOString(),
      };
    });
    setData({ ...data, expenses });
  }

  function deleteExpense(id) {
    setData({ ...data, expenses: data.expenses.filter((e) => e.id !== Number(id)) });
  }

  // Changing categories
  function createCategory(values) {
    const clean = checkCategory(values, data.categories);
    const category = { id: data.nextCategoryId, ...clean };
    setData({ ...data, categories: [...data.categories, category], nextCategoryId: data.nextCategoryId + 1 });
  }

  function updateCategory(id, values) {
    const category = data.categories.find((c) => c.id === id);
    const clean = checkCategory(values, data.categories, id);
    if (isFallback(category) && clean.name !== FALLBACK_CATEGORY_NAME) {
      throw formError({ name: `"${FALLBACK_CATEGORY_NAME}" can't be renamed. Other categories move their expenses here.` });
    }
    setData({ ...data, categories: data.categories.map((c) => (c.id === id ? { ...c, ...clean } : c)) });
  }

  /** Moves the category's expenses to "Other", then deletes it. */
  function deleteCategory(id) {
    const category = data.categories.find((c) => c.id === id);
    if (isFallback(category)) throw new Error(`"${FALLBACK_CATEGORY_NAME}" can't be deleted.`);
    const fallback = data.categories.find(isFallback);
    setData({
      ...data,
      categories: data.categories.filter((c) => c.id !== id),
      expenses: data.expenses.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)),
    });
  }

  // Settings
  function setLastCurrency(code) {
    saveItem(CURRENCY_KEY, code);
    setLastCurrencyState(code);
  }

  const value = {
    categories,
    listExpenses,
    getExpense,
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    updateCategory,
    deleteCategory,
    lastCurrency,
    setLastCurrency,
    resetSampleData: () => setData(sampleData()),
    clearAllData: () => setData(emptyData()),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}
