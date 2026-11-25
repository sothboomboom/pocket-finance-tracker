// Fake expenses endpoints.
import { ApiError } from '../api/client.js';
import {
  categories,
  expenses,
  findCategory,
  findExpense,
  newExpenseId,
  roundCents,
  saveDb,
  FALLBACK_CATEGORY_NAME,
} from './db.js';
import { getRateToUsd } from './rates.js';
import { validateExpense, validateId } from './validation.js';

// Stored rows keep only categoryId; responses include the whole category.
function toExpense(row) {
  const { categoryId, ...rest } = row;
  const { id, name, color, icon } = findCategory(categoryId);
  return { ...rest, category: { id, name, color, icon } };
}

function assertCategoryExists(categoryId) {
  if (!findCategory(categoryId)) {
    throw new ApiError(400, 'Please fix the highlighted fields', {
      fieldErrors: { categoryId: 'That category no longer exists' },
    });
  }
}

// Newest first; ties broken by time recorded, then id, so the order never jumps.
function newestFirst(a, b) {
  return b.spentAt.localeCompare(a.spentAt) || b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
}

/** All filters are optional. `q` searches the note and category name. */
export function listExpenses({ from = null, to = null, categoryId = null, paymentMethod = null, q = '' }) {
  const search = (q ?? '').trim().toLowerCase();
  return expenses
    .filter((e) => (!from || e.spentAt >= from) && (!to || e.spentAt <= to))
    .filter((e) => !categoryId || e.categoryId === categoryId)
    .filter((e) => !paymentMethod || e.paymentMethod === paymentMethod)
    .sort(newestFirst)
    .map(toExpense)
    .filter((e) => !search || `${e.note ?? ''} ${e.category.name}`.toLowerCase().includes(search));
}

export function getExpense(id) {
  const row = findExpense(validateId(id));
  if (!row) throw new ApiError(404, 'Expense not found');
  return toExpense(row);
}

export async function createExpense(body) {
  const input = validateExpense(body);
  assertCategoryExists(input.categoryId);

  // The rate is picked here, never taken from the form, so it can't be tampered with.
  const rateToUsd = await getRateToUsd(input.currency);
  const now = new Date().toISOString();
  const row = {
    id: newExpenseId(),
    ...input,
    rateToUsd,
    amountUsd: roundCents(input.amount * rateToUsd),
    createdAt: now,
    updatedAt: now,
  };
  expenses.push(row);
  saveDb();
  return toExpense(row);
}

export async function updateExpense(id, body) {
  const row = findExpense(validateId(id));
  if (!row) throw new ApiError(404, 'Expense not found');
  const input = validateExpense(body);
  assertCategoryExists(input.categoryId);

  // Keep the saved rate unless the currency changed, so editing a note never changes past totals.
  const rateToUsd = row.currency === input.currency ? row.rateToUsd : await getRateToUsd(input.currency);
  Object.assign(row, input, {
    rateToUsd,
    amountUsd: roundCents(input.amount * rateToUsd),
    updatedAt: new Date().toISOString(),
  });
  saveDb();
  return toExpense(row);
}

export function deleteExpense(id) {
  const index = expenses.findIndex((e) => e.id === validateId(id));
  if (index === -1) throw new ApiError(404, 'Expense not found');
  expenses.splice(index, 1);
  saveDb();
}

/**
 * Undo for a delete: restores the expense exactly as it was.
 * If its category was deleted meanwhile, it goes to "Other".
 */
export function restoreExpense(expense) {
  const id = validateId(expense?.id);
  if (findExpense(id)) return toExpense(findExpense(id)); // Undo clicked twice
  const categoryId = findCategory(expense.category?.id)
    ? expense.category.id
    : categories.find((c) => c.name === FALLBACK_CATEGORY_NAME).id;
  const row = {
    id,
    amount: expense.amount,
    currency: expense.currency,
    rateToUsd: expense.rateToUsd,
    amountUsd: expense.amountUsd,
    categoryId,
    paymentMethod: expense.paymentMethod,
    note: expense.note,
    spentAt: expense.spentAt,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
  expenses.push(row);
  saveDb();
  return toExpense(row);
}
