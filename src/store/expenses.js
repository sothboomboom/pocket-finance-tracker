// Reading and changing expenses.
import { CURRENCIES } from '../constants/currencies.js';
import { NOTE_MAX_LENGTH } from '../constants/expenses.js';
import { convertToUsd } from '../utils/money.js';
import { db, save, findCategory, formError } from './db.js';
import { RATES_TO_USD } from './rates.js';

/** Returns clean values, or throws an error with a message per field. */
function checkExpense(values) {
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

  if (!findCategory(values.categoryId)) errors.categoryId = 'Choose a category';
  if (!['cash', 'bank'].includes(values.paymentMethod)) errors.paymentMethod = 'Choose Cash or Bank';
  if (!values.spentAt) errors.spentAt = 'Choose a date';

  const note = values.note?.trim() || null;
  if (note && note.length > NOTE_MAX_LENGTH) errors.note = `Keep the note under ${NOTE_MAX_LENGTH} characters`;

  if (Object.keys(errors).length > 0) throw formError(errors);
  const { categoryId, paymentMethod, spentAt } = values;
  return { amount, currency, categoryId: Number(categoryId), paymentMethod, spentAt, note };
}

// Saved expenses keep only categoryId; what the app shows includes the whole category.
function withCategory(expense) {
  const { categoryId, ...rest } = expense;
  const { id, name, icon } = findCategory(categoryId);
  return { ...rest, category: { id, name, icon } };
}

// Newest first; ties broken by time recorded, then id, so the order never jumps.
function newestFirst(a, b) {
  return b.spentAt.localeCompare(a.spentAt) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
}

/** Every filter is optional. */
export function listExpenses({ from = null, to = null, categoryId = null, paymentMethod = null }) {
  return db.expenses
    .filter((e) => (!from || e.spentAt >= from) && (!to || e.spentAt <= to))
    .filter((e) => !categoryId || e.categoryId === categoryId)
    .filter((e) => !paymentMethod || e.paymentMethod === paymentMethod)
    .sort(newestFirst)
    .map(withCategory);
}

/** null when there is no expense with this id (a bad link, or deleted). */
export function getExpense(id) {
  const expense = db.expenses.find((e) => e.id === Number(id));
  return expense ? withCategory(expense) : null;
}

export function createExpense(values) {
  const clean = checkExpense(values);
  const rateToUsd = RATES_TO_USD[clean.currency];
  const now = new Date().toISOString();
  const expense = {
    id: db.nextExpenseId++,
    ...clean,
    rateToUsd,
    amountUsd: convertToUsd(clean.amount, rateToUsd),
    createdAt: now,
    updatedAt: now,
  };
  db.expenses.push(expense);
  save();
  return withCategory(expense);
}

export function updateExpense(id, values) {
  const expense = db.expenses.find((e) => e.id === Number(id));
  const clean = checkExpense(values);
  // Keep the saved rate unless the currency changed, so editing a note never changes past totals.
  const rateToUsd = expense.currency === clean.currency ? expense.rateToUsd : RATES_TO_USD[clean.currency];
  Object.assign(expense, clean, {
    rateToUsd,
    amountUsd: convertToUsd(clean.amount, rateToUsd),
    updatedAt: new Date().toISOString(),
  });
  save();
  return withCategory(expense);
}

export function deleteExpense(id) {
  db.expenses = db.expenses.filter((e) => e.id !== Number(id));
  save();
}
