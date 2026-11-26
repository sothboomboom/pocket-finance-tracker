import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, parse, isValid } from 'date-fns';

const MONTH_PATTERN = 'yyyy-MM';
const METHODS = ['cash', 'bank'];

const thisMonth = () => format(new Date(), MONTH_PATTERN);

function parseMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value ?? '')) return null;
  return isValid(parse(value, MONTH_PATTERN, new Date())) ? value : null;
}

export function useExpenseFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const categoryId = Number(searchParams.get('category'));
    const method = searchParams.get('method');
    return {
      month: parseMonth(searchParams.get('month')) ?? thisMonth(),
      categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null,
      paymentMethod: METHODS.includes(method) ? method : null,
    };
  }, [searchParams]);

  // An empty value removes the filter
  function setFilter(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
      return next;
    });
  }

  /** Clears category and method, but keeps the month */
  function clearFilters() {
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      if (prev.get('month')) next.set('month', prev.get('month'));
      return next;
    });
  }

  const hasFilters = filters.categoryId !== null || filters.paymentMethod !== null;

  return { filters, setFilter, clearFilters, hasFilters, isThisMonth: filters.month === thisMonth() };
}
