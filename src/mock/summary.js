// Fake dashboard endpoint: totals per period, category, payment method and day.
import { expenses, findCategory, roundCents } from './db.js';
import { periodRange, previousPeriodRange, daysBetween, localTodayISO, addDays } from './dates.js';
import { validateSummaryQuery } from './validation.js';

const inRange = ({ from, to }) => (e) => e.spentAt >= from && e.spentAt <= to;
const sumUsd = (rows) => roundCents(rows.reduce((sum, e) => sum + e.amountUsd, 0));

function getByCategory(rows) {
  const groups = new Map();
  for (const e of rows) {
    const group = groups.get(e.categoryId) ?? { total: 0, count: 0 };
    group.total += e.amountUsd;
    group.count += 1;
    groups.set(e.categoryId, group);
  }
  return [...groups]
    .map(([categoryId, { total, count }]) => {
      const { id, name, color, icon } = findCategory(categoryId);
      return { category: { id, name, color, icon }, total: roundCents(total), count };
    })
    .sort((a, b) => b.total - a.total || a.category.name.localeCompare(b.category.name));
}

/** One bucket per hour (day view) or per day (week/month), including empty ones, so charts have no gaps. */
function getSeries(period, range, rows) {
  if (period === 'day') {
    // Expenses only store a date, so hours come from when they were recorded.
    const totals = Array(24).fill(0);
    for (const e of rows) totals[new Date(e.createdAt).getHours()] += e.amountUsd;
    return totals.map((total, hour) => ({ key: hour, total: roundCents(total) }));
  }

  const series = [];
  for (let day = range.from; day <= range.to; day = addDays(day, 1)) {
    series.push({ key: day, total: sumUsd(rows.filter((e) => e.spentAt === day)) });
  }
  return series;
}

export function getSummary({ period = 'week', date = localTodayISO() }) {
  validateSummaryQuery({ period, date });
  const range = periodRange(period, date);
  const previousRange = previousPeriodRange(period, range);

  const rows = expenses.filter(inRange(range));
  const previousRows = expenses.filter(inRange(previousRange));

  // Average only over days that have happened: a week that started yesterday counts 2 days, not 7.
  const today = localTodayISO();
  const lastCountedDay = range.to < today ? range.to : today;
  const daysCounted = range.from > today ? 0 : daysBetween(range.from, lastCountedDay);
  const total = sumUsd(rows);

  return {
    period,
    range,
    previousRange,
    total,
    count: rows.length,
    averagePerDay: daysCounted > 0 ? roundCents(total / daysCounted) : null,
    daysCounted,
    paymentSplit: {
      cash: sumUsd(rows.filter((e) => e.paymentMethod === 'cash')),
      bank: sumUsd(rows.filter((e) => e.paymentMethod === 'bank')),
    },
    previousTotal: sumUsd(previousRows),
    byCategory: getByCategory(rows),
    series: getSeries(period, range, rows),
  };
}
