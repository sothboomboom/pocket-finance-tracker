import { CURRENCIES, BASE_CURRENCY } from '../data/currencies.js';

const numberFormatters = new Map();

function getNumberFormatter(decimals) {
  if (!numberFormatters.has(decimals)) {
    numberFormatters.set(
      decimals,
      new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    );
  }
  return numberFormatters.get(decimals);
}

/**
 * formatMoney(15000, 'KHR') -> '៛15,000'.
 * Uses our own symbols: Intl's currency style prints 'KHR 15,000' instead of '៛15,000'.
 */
export function formatMoney(amount, currency = BASE_CURRENCY) {
  const { symbol, decimals } = CURRENCIES[currency] ?? { symbol: `${currency} `, decimals: 2 };
  return `${symbol}${getNumberFormatter(decimals).format(amount)}`;
}

/** Rounds to whole cents. The store uses it too, so the preview matches the saved amount. */
export function convertToUsd(amount, rateToUsd) {
  return Math.round(Number(amount) * rateToUsd * 100) / 100;
}

/** Adds in whole cents: plain float addition gives 0.1 + 0.2 = 0.30000000000000004. */
export function sumUsd(expenses) {
  const cents = expenses.reduce((total, e) => total + Math.round(e.amountUsd * 100), 0);
  return cents / 100;
}

const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

/** Axis ticks: 0 -> '$0', 1500 -> '$1.5K' */
export function formatCompactUsd(amount) {
  return `$${compactFormatter.format(amount)}`;
}

/** Share of a total as a whole percent; tiny non-zero shares show '<1%'. */
export function formatShare(part, total) {
  if (!total) return '0%';
  const pct = (part / total) * 100;
  if (pct > 0 && pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
}
