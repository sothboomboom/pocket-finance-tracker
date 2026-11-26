import { getSummary } from '../api/summary.js';
import { useApiData } from './useApiData.js';
import { useAppData } from '../context/DataContext.js';

export function useSummary({ period, date }) {
  const { version } = useAppData();
  const { data, status, error, reload, isRefreshing } = useApiData(
    (options) => getSummary({ period, date }, options),
    [period, date, version],
    { keepPrevious: true },
  );
  return { summary: data, status, error, reload, isRefreshing };
}
