// The "database": plain arrays saved to localStorage after every change.
// Starts from the sample data on the first visit or after a reset.
import { SEED_CATEGORIES, SEED_EXPENSES } from './seedData.js';
import { FALLBACK_RATES_TO_USD } from './rates.js';
import { addDays, localTodayISO } from './dates.js';

export const FALLBACK_CATEGORY_NAME = 'Other';

// Bump the version if the saved shape changes, so old data isn't misread.
const STORAGE_KEY = 'pocket:data:v1';

// Rounds USD conversions to whole cents.
export const roundCents = (n) => Math.round(n * 100) / 100;

/** { id, name, color, icon } */
export const categories = [];
/** { id, amount, currency, rateToUsd, amountUsd, categoryId, paymentMethod, note, spentAt, createdAt, updatedAt } */
export const expenses = [];
// Ids are never reused, even after a delete, so a link to a deleted expense can't open another one.
const counters = { nextCategoryId: 1, nextExpenseId: 1 };

export const newCategoryId = () => counters.nextCategoryId++;
export const newExpenseId = () => counters.nextExpenseId++;

function buildSeed() {
  categories.length = 0;
  expenses.length = 0;
  counters.nextCategoryId = 1;
  counters.nextExpenseId = 1;

  for (const c of SEED_CATEGORIES) categories.push({ id: newCategoryId(), ...c });

  // Dated relative to today, so Home and the charts always have recent data.
  const today = localTodayISO();
  for (const [daysAgo, hour, categoryName, amount, currency, paymentMethod, note] of SEED_EXPENSES) {
    const spentAt = addDays(today, -daysAgo);
    const [y, m, d] = spentAt.split('-').map(Number);
    const createdAt = new Date(y, m - 1, d, hour, 0, 0).toISOString();
    const rateToUsd = FALLBACK_RATES_TO_USD[currency];
    expenses.push({
      id: newExpenseId(),
      amount,
      currency,
      rateToUsd,
      amountUsd: roundCents(amount * rateToUsd),
      categoryId: categories.find((c) => c.name === categoryName).id,
      paymentMethod,
      note,
      spentAt,
      createdAt,
      updatedAt: createdAt,
    });
  }
}

/** Returns false when nothing usable is saved, so the caller falls back to the sample data. */
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved?.categories) || !Array.isArray(saved?.expenses)) return false;
    if (!saved.categories.some((c) => c.name === FALLBACK_CATEGORY_NAME)) return false;
    if (!Number.isInteger(saved.nextCategoryId) || !Number.isInteger(saved.nextExpenseId)) return false;
    categories.push(...saved.categories);
    expenses.push(...saved.expenses);
    counters.nextCategoryId = saved.nextCategoryId;
    counters.nextExpenseId = saved.nextExpenseId;
    return true;
  } catch {
    return false; // private mode, blocked storage, or corrupted JSON
  }
}

/** Call after every change. */
export function saveDb() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, expenses, ...counters }));
  } catch {
    // Storage full or blocked: keep working, just without remembering.
  }
}

export function resetDb() {
  buildSeed();
  saveDb();
}

if (!loadSaved()) resetDb();

export function findCategory(id) {
  return categories.find((c) => c.id === id);
}

export function findExpense(id) {
  return expenses.find((e) => e.id === id);
}
