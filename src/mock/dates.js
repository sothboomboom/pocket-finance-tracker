// Date math on 'YYYY-MM-DD' strings, done in UTC so a timezone can never shift a day.

const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
const toISO = (date) => date.toISOString().slice(0, 10);

export function addDays(iso, days) {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

/** Inclusive number of days from `from` to `to` (same day = 1). */
export function daysBetween(from, to) {
  return Math.round((toDate(to) - toDate(from)) / 86_400_000) + 1;
}

/** Today's date in the browser's local timezone, as 'YYYY-MM-DD'. */
export function localTodayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Inclusive { from, to } of the day, week (Monday first) or month containing `iso`. */
export function periodRange(period, iso) {
  if (period === 'day') return { from: iso, to: iso };
  if (period === 'week') {
    const dayOfWeek = toDate(iso).getUTCDay(); // 0 = Sunday
    const from = addDays(iso, -((dayOfWeek + 6) % 7)); // back to Monday
    return { from, to: addDays(from, 6) };
  }
  const d = toDate(iso);
  const first = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)); // day 0 = last day of previous month
  return { from: toISO(first), to: toISO(last) };
}

/** The period just before the one starting at `from` (for "vs last week"). */
export function previousPeriodRange(period, { from }) {
  return periodRange(period, addDays(from, -1));
}
