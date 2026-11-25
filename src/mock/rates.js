// Exchange rates as "1 unit of currency = X USD".
// KRW, JPY and CNY come from the Frankfurter API at most once a day (cached in
// localStorage). If it fails: last saved rates, then built-in ones.
// KHR is fixed at 4000 = 1 USD.

const FRANKFURTER_URL = 'https://api.frankfurter.dev/v1';
const LIVE_CURRENCIES = ['KRW', 'JPY', 'CNY'];
const CACHE_KEY = 'pocket:rates';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_AFTER_FAILURE_MS = 60 * 60 * 1000; // don't hammer a broken API
const FETCH_TIMEOUT_MS = 5000;

const KHR_RATE_TO_USD = 1 / 4000;

const round8 = (n) => Math.round(n * 1e8) / 1e8;

// Last-resort rates (Frankfurter, 2026-10-30). Update them now and then.
export const FALLBACK_RATES_TO_USD = {
  USD: 1,
  KRW: round8(1 / 1335.27),
  JPY: round8(1 / 157.25),
  CNY: round8(1 / 6.6529),
  KHR: KHR_RATE_TO_USD,
};

let lastFailedAttemptAt = 0;
let inFlightRefresh = null; // shared, so parallel callers fetch only once

/** { rates: { KRW, JPY, CNY }, fetchedAt: ms } or null */
function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    const complete = LIVE_CURRENCIES.every((code) => cached?.rates?.[code] > 0);
    return complete && Number.isFinite(cached.fetchedAt) ? cached : null;
  } catch {
    return null;
  }
}

function writeCache(cached) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Not critical: we fetch again next time.
  }
}

/** Fetches "1 USD = X" from Frankfurter and flips it to "1 X = ? USD". */
async function fetchLiveRates() {
  const url = `${FRANKFURTER_URL}/latest?base=USD&symbols=${LIVE_CURRENCIES.join(',')}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Frankfurter responded ${response.status}`);
  const data = await response.json();
  const rates = {};
  for (const code of LIVE_CURRENCIES) {
    const perUsd = data?.rates?.[code];
    if (typeof perUsd !== 'number' || perUsd <= 0) throw new Error(`Frankfurter returned no rate for ${code}`);
    rates[code] = round8(1 / perUsd);
  }
  return rates;
}

async function refresh(cached) {
  try {
    const fresh = { rates: await fetchLiveRates(), fetchedAt: Date.now() };
    writeCache(fresh);
    return { ...fresh, source: 'live' };
  } catch (err) {
    lastFailedAttemptAt = Date.now();
    console.warn(`Exchange-rate refresh failed (${err.message}); using ${cached ? 'saved' : 'built-in'} rates`);
    return cached ? { ...cached, source: 'cache' } : { rates: FALLBACK_RATES_TO_USD, fetchedAt: null, source: 'fallback' };
  }
}

/** source: 'live' (just fetched) | 'cache' (saved) | 'fallback' (built-in, API unreachable) */
export async function getRates() {
  const cached = readCache();
  const isFresh = cached && Date.now() - cached.fetchedAt < ONE_DAY_MS;
  const recentlyFailed = Date.now() - lastFailedAttemptAt < RETRY_AFTER_FAILURE_MS;

  let result;
  if (isFresh) {
    result = { ...cached, source: 'cache' };
  } else if (recentlyFailed) {
    result = cached
      ? { ...cached, source: 'cache' }
      : { rates: FALLBACK_RATES_TO_USD, fetchedAt: null, source: 'fallback' };
  } else {
    inFlightRefresh ??= refresh(cached).finally(() => {
      inFlightRefresh = null;
    });
    result = await inFlightRefresh;
  }

  return {
    base: 'USD',
    rates: { ...FALLBACK_RATES_TO_USD, ...result.rates, USD: 1, KHR: KHR_RATE_TO_USD },
    updatedAt: result.fetchedAt ? new Date(result.fetchedAt).toISOString() : null,
    source: result.source,
  };
}

export async function getRateToUsd(currency) {
  const { rates } = await getRates();
  return rates[currency];
}