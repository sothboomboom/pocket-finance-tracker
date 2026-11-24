// Input checks. Errors come back as { fieldErrors: { field: message } } so forms
// can show each message under its field.
import { ApiError } from '../api/client.js';
import { CATEGORY_COLOR_OPTIONS, CATEGORY_NAME_MAX_LENGTH } from '../constants/categoryColors.js';
import { CATEGORY_ICON_OPTIONS } from '../constants/categoryIcons.js';
import { NOTE_MAX_LENGTH } from '../constants/expenses.js';
import { CURRENCIES } from '../constants/currencies.js';

const PAYMENT_METHODS = ['cash', 'bank'];
const CATEGORY_COLORS = CATEGORY_COLOR_OPTIONS.map((c) => c.value);
const CATEGORY_ICONS = CATEGORY_ICON_OPTIONS.map((i) => i.name);

function throwIfErrors(errors) {
  if (Object.keys(errors).length > 0) {
    throw new ApiError(400, 'Please fix the highlighted fields', { fieldErrors: errors });
  }
}

/** True for a real calendar date written as 'YYYY-MM-DD' (rejects 2026-02-30). */
export function isISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** 12 or '12' -> 12; anything else -> null. */
function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Accepts at most `decimals` decimals (0 for KRW, JPY, KHR); otherwise null. */
function toMoney(value, decimals) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value).trim();
  const pattern = decimals > 0 ? new RegExp(`^\\d{1,12}(\\.\\d{1,${decimals}})?$`) : /^\d{1,12}$/;
  return pattern.test(text) ? Number(text) : null;
}

export function validateId(id) {
  const value = toPositiveInt(id);
  if (!value) throw new ApiError(400, 'Invalid id');
  return value;
}

/** Returns trimmed, typed values, or throws an ApiError with field errors. */
export function validateExpense(body) {
  const errors = {};

  const currency = typeof body.currency === 'string' ? body.currency.toUpperCase() : 'USD';
  if (!CURRENCIES[currency]) errors.currency = 'This currency is not supported';

  const decimals = CURRENCIES[currency]?.decimals ?? 2;
  const amount = toMoney(body.amount, decimals);
  if (amount === null && Number(body.amount) <= 0) {
    errors.amount = 'Amount must be more than 0';
  } else if (amount === null) {
    errors.amount = decimals === 0 ? 'Enter a whole number amount' : 'Enter an amount with up to 2 decimals';
  } else if (amount <= 0) {
    errors.amount = 'Amount must be more than 0';
  }

  const categoryId = toPositiveInt(body.categoryId);
  if (!categoryId) errors.categoryId = 'Choose a category';

  const { paymentMethod, spentAt } = body;
  if (!PAYMENT_METHODS.includes(paymentMethod)) errors.paymentMethod = 'Choose Cash or Bank';
  if (!isISODate(spentAt)) errors.spentAt = 'Choose a valid date';

  let note = null;
  if (body.note !== undefined && body.note !== null) {
    if (typeof body.note !== 'string') {
      errors.note = 'Note must be text';
    } else {
      note = body.note.trim() || null;
      if (note && note.length > NOTE_MAX_LENGTH) errors.note = `Keep the note under ${NOTE_MAX_LENGTH} characters`;
    }
  }

  throwIfErrors(errors);
  return { amount, currency, categoryId, paymentMethod, spentAt, note };
}

/** Returns trimmed values, or throws an ApiError with field errors. */
export function validateCategory(body) {
  const errors = {};
  const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  if (!name) errors.name = 'Enter a name';
  else if (name.length > CATEGORY_NAME_MAX_LENGTH) errors.name = `Keep the name under ${CATEGORY_NAME_MAX_LENGTH} characters`;
  if (!CATEGORY_COLORS.includes(body.color)) errors.color = 'Choose a color';
  if (!CATEGORY_ICONS.includes(body.icon)) errors.icon = 'Choose an icon';
  throwIfErrors(errors);
  return { name, color: body.color, icon: body.icon };
}

const PERIODS = ['day', 'week', 'month'];

export function validateSummaryQuery({ period, date }) {
  const errors = {};
  if (!PERIODS.includes(period)) errors.period = 'Use day, week or month';
  if (!isISODate(date)) errors.date = 'Use the format YYYY-MM-DD';
  throwIfErrors(errors);
}
