// Exchange rates: what 1 unit of each currency is worth in US dollars.
// They are fixed in the app (from the Frankfurter API, 2026-10-30). KHR is fixed at 4000 = 1 USD.
export const RATES_TO_USD = {
  USD: 1,
  KRW: 1 / 1335.27,
  JPY: 1 / 157.25,
  CNY: 1 / 6.6529,
  KHR: 1 / 4000,
};
