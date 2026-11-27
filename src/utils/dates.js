import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isToday,
  isYesterday,
  isSameYear,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
} from 'date-fns';

const WEEK_OPTIONS = { weekStartsOn: 1 }; // Monday

/** Date -> 'YYYY-MM-DD' in the user's local timezone. */
function toISODate(date) {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO() {
  return toISODate(new Date());
}

/** getPeriodRange('week') -> { from: '2026-10-26', to: '2026-11-01' } (inclusive) */
export function getPeriodRange(period, date = new Date()) {
  switch (period) {
    case 'day':
      return { from: toISODate(date), to: toISODate(date) };
    case 'week':
      return { from: toISODate(startOfWeek(date, WEEK_OPTIONS)), to: toISODate(endOfWeek(date, WEEK_OPTIONS)) };
    case 'month':
      return { from: toISODate(startOfMonth(date)), to: toISODate(endOfMonth(date)) };
    default:
      throw new Error(`Unknown period: ${period}`);
  }
}

/** 'Mon, Nov 2' · 'Oct 27 – Nov 2' · 'November 2026' */
export function formatRangeLabel(period, { from, to }) {
  const start = parseISO(from);
  const end = parseISO(to);
  if (period === 'day') return format(start, 'EEE, MMM d');
  if (period === 'month') return format(start, 'MMMM yyyy');
  const endPattern = isSameMonth(start, end) ? 'd' : 'MMM d';
  return `${format(start, 'MMM d')} – ${format(end, endPattern)}`;
}

/** 'Today' · 'Yesterday' · 'Mon, Oct 27' · 'Mon, Oct 27, 2025' (other years) */
export function formatDayLabel(isoDate) {
  const date = parseISO(isoDate);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, isSameYear(date, new Date()) ? 'EEE, MMM d' : 'EEE, MMM d, yyyy');
}

/** Expects expenses sorted newest first. Returns [{ date, items }]. */
export function groupByDay(expenses) {
  const groups = [];
  for (const expense of expenses) {
    const last = groups.at(-1);
    if (last && last.date === expense.spentAt) {
      last.items.push(expense);
    } else {
      groups.push({ date: expense.spentAt, items: [expense] });
    }
  }
  return groups;
}

/** Moves an anchor date one period back (-1) or forward (+1). */
export function shiftPeriod(period, isoDate, direction) {
  const date = parseISO(isoDate);
  if (period === 'day') return toISODate(addDays(date, direction));
  if (period === 'week') return toISODate(addWeeks(date, direction));
  return toISODate(addMonths(date, direction));
}

export function formatDate(isoDate, pattern) {
  return format(parseISO(isoDate), pattern);
}
