import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parse, isValid } from 'date-fns';

const MONTH_PATTERN = 'yyyy-MM';
const METHODS = ['cash', 'bank'];

const thisMonth = () => format(new Date(), MONTH_PATTERN);

function parseMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value ?? '')) return null;
  return isValid(parse(value, MONTH_PATTERN, new Date())) ? value : null;
}

/**
 * Filters live in the URL (/expenses?month=2026-11&category=3&method=cash&q=coffee),
 * so Back/Forward and shared links keep them. Invalid values fall back to defaults.
 */
export function useExpenseFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const categoryId = Number(searchParams.get('category'));
    const method = searchParams.get('method');
    return {
      month: parseMonth(searchParams.get('month')) ?? thisMonth(),
      categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null,
      paymentMethod: METHODS.includes(method) ? method : null,
      q: searchParams.get('q') ?? '',
    };
  }, [searchParams]);

  // An empty value removes the filter. `replace` is for typing, so Back doesn't undo letter by letter.
  const setFilter = useCallback(
    (key, value, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === null || value === undefined || value === '') next.delete(key);
          else next.set(key, String(value));
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  /** Clears category, method and search, but keeps the month. */
  const clearFilters = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('month')) next.set('month', prev.get('month'));
      return next;
    });
  }, [setSearchParams]);

  const hasFilters = filters.categoryId !== null || filters.paymentMethod !== null || filters.q.trim() !== '';

  return { filters, setFilter, clearFilters, hasFilters, isThisMonth: filters.month === thisMonth() };
}
