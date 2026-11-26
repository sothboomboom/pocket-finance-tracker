// Dashboard totals for a day, week or month: by category, by payment method and over time.
import { addDays, differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';
import { getPeriodRange, todayISO } from '../utils/dates.js';
import { sumUsd } from '../utils/money.js';
import { db, findCategory } from './db.js';

const inRange = ({ from, to }) => (e) => e.spentAt >= from && e.spentAt <= to;

/** Biggest first: [{ category, total, count }] */
function byCategory(rows) {
  const ids = [...new Set(rows.map((e) => e.categoryId))];
  return ids
    .map((id) => {
      const mine = rows.filter((e) => e.categoryId === id);
      const { name, color, icon } = findCategory(id);
      return { category: { id, name, color, icon }, total: sumUsd(mine), count: mine.length };
    })
    .sort((a, b) => b.total - a.total || a.category.name.localeCompare(b.category.name));
}

/** One bar per hour (day view) or per day (week, month), including empty ones, so charts have no gaps. */
function series(period, range, rows) {
  if (period === 'day') {
    // Expenses only store a date, so hours come from when they were recorded.
    return Array.from({ length: 24 }, (_, hour) => ({
      key: hour,
      total: sumUsd(rows.filter((e) => new Date(e.createdAt).getHours() === hour)),
    }));
  }
  const days = differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1;
  return Array.from({ length: days }, (_, i) => {
    const day = format(addDays(parseISO(range.from), i), 'yyyy-MM-dd');
    return { key: day, total: sumUsd(rows.filter((e) => e.spentAt === day)) };
  });
}

export function getSummary({ period, date }) {
  const range = getPeriodRange(period, parseISO(date));
  const previousRange = getPeriodRange(period, subDays(parseISO(range.from), 1));
  const rows = db.expenses.filter(inRange(range));
  const total = sumUsd(rows);

  // Average only over days that have happened: a week that started yesterday counts 2 days, not 7.
  const today = todayISO();
  const lastDay = range.to < today ? range.to : today;
  const daysCounted = range.from > today ? 0 : differenceInCalendarDays(parseISO(lastDay), parseISO(range.from)) + 1;

  return {
    period,
    range,
    total,
    count: rows.length,
    averagePerDay: daysCounted > 0 ? Math.round((total / daysCounted) * 100) / 100 : null,
    paymentSplit: {
      cash: sumUsd(rows.filter((e) => e.paymentMethod === 'cash')),
      bank: sumUsd(rows.filter((e) => e.paymentMethod === 'bank')),
    },
    previousTotal: sumUsd(db.expenses.filter(inRange(previousRange))),
    byCategory: byCategory(rows),
    series: series(period, range, rows),
  };
}
