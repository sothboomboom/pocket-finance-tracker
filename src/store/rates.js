// Exchange rates as "1 unit of currency = X USD".
// KRW, JPY and CNY come from the free Frankfurter API at most once a day and are
// cached in localStorage. If it can't be reached: the saved rates, else built-in ones.
// KHR is fixed at 4000 = 1 USD.

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW,JPY,CNY';
const LIVE_CURRENCIES = ['KRW', 'JPY', 'CNY'];
const CACHE_KEY = 'pocket:rates';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

const round8 = (n) => Math.round(n * 1e8) / 1e8;

// Last-resort rates (Frankfurter, 2026-10-30). Update them now and then.
export const FALLBACK_RATES_TO_USD = {
  USD: 1,
  KRW: round8(1 / 1335.27),
  JPY: round8(1 / 157.25),
  CNY: round8(1 / 6.6529),
  KHR: 1 / 4000,
};

// After a failed fetch, wait an hour before trying again, so an offline app stays fast.
let lastFailedAt = 0;

/** { rates: { KRW, JPY, CNY }, fetchedAt } or null */
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    return LIVE_CURRENCIES.every((code) => cached?.rates?.[code] > 0) ? cached : null;
  } catch {
    return null;
  }
}

/** Frankfurter gives "1 USD = X"; we flip it to "1 X = ? USD". */
async function fetchLiveRates() {
  const response = await fetch(FRANKFURTER_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Frankfurter responded ${response.status}`);
  const data = await response.json();
  const rates = {};
  for (const code of LIVE_CURRENCIES) rates[code] = round8(1 / data.rates[code]);
  return rates;
}

/** { rates: { USD, KRW, JPY, CNY, KHR }, updatedAt, source: 'live' | 'cache' | 'fallback' } */
export async function getRates() {
  let cached = readCache();
  let source = cached ? 'cache' : 'fallback';

  const isFresh = cached && Date.now() - cached.fetchedAt < ONE_DAY_MS;
  if (!isFresh && Date.now() - lastFailedAt > ONE_HOUR_MS) {
    try {
      cached = { rates: await fetchLiveRates(), fetchedAt: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      source = 'live';
    } catch (err) {
      lastFailedAt = Date.now();
      console.warn(`Exchange rates couldn't be refreshed (${err.message}); using ${source} rates.`);
    }
  }

  return {
    rates: { ...FALLBACK_RATES_TO_USD, ...cached?.rates },
    updatedAt: cached ? new Date(cached.fetchedAt).toISOString() : null,
    source,
  };
}

export async function getRateToUsd(currency) {
  const { rates } = await getRates();
  return rates[currency];
}
