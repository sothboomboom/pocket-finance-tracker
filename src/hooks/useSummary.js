import { useMemo } from 'react';
import { getSummary } from '../store/summary.js';
import { useAppData } from '../context/DataContext.js';

/** Dashboard totals; worked out again after any change (`version`). */
export function useSummary({ period, date }) {
  const { version } = useAppData();
  return useMemo(() => getSummary({ period, date }), [period, date, version]);
}
