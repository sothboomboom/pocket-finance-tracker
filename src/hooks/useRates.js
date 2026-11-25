import { getRates } from '../api/rates.js';
import { useApiData } from './useApiData.js';

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
