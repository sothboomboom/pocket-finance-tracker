import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { PageHeader } from '../components/Layout.jsx';
import { IconButton } from '../components/Button.jsx';
import { Card, SegmentedControl, CategoryIcon } from '../components/UI.jsx';
import { useFinance } from '../context/useFinance.js';
import { getPeriodRange, formatRangeLabel, shiftPeriod, todayISO, formatDate, formatDayLabel } from '../utils/dates.js';
import { formatMoney, formatShare, formatCompactUsd, sumUsd } from '../utils/money.js';
import styles from './DashboardPage.module.css';

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

const CHART = {
  barRadius: [4, 4, 0, 0], // rounded top, square at the baseline
  maxBarSize: 24,
  yAxisWidth: 48,
};

export default function DashboardPage() {
  const { listExpenses } = useFinance();
  const [period, setPeriod] = useState('week');
  // Any day inside the shown period; the arrows move it by one period.
  const [date, setDate] = useState(todayISO);

  const range = getPeriodRange(period, parseISO(date));
  const summary = summarize(range, listExpenses(range));

  return (
    <>
      <PageHeader title="Dashboard" />

      <PeriodNavigator
        period={period}
        onPeriodChange={setPeriod}
        rangeLabel={formatRangeLabel(period, range)}
        onPrevious={() => setDate((d) => shiftPeriod(period, d, -1))}
        onNext={() => setDate((d) => shiftPeriod(period, d, 1))}
        canGoNext={range.to < todayISO()}
      />

      <div className={styles.content}>
        <StatsRow summary={summary} />
        <div className={styles.grid}>
          <SpendingBarChart period={period} series={summary.series} total={summary.total} />
          <TopCategories byCategory={summary.byCategory} total={summary.total} />
        </div>
      </div>
    </>
  );
}

/** Totals for one period: overall, per day and per category. */
function summarize(range, expenses) {
  const total = sumUsd(expenses);

  // Average only over days that have happened: a week that started yesterday counts 2 days, not 7.
  const today = todayISO();
  const lastDay = range.to < today ? range.to : today;
  const daysCounted = range.from > today ? 0 : differenceInCalendarDays(parseISO(lastDay), parseISO(range.from)) + 1;

  // One bar per day, including empty days, so the chart has no gaps.
  const dayCount = differenceInCalendarDays(parseISO(range.to), parseISO(range.from)) + 1;
  const series = Array.from({ length: dayCount }, (_, i) => {
    const day = format(addDays(parseISO(range.from), i), 'yyyy-MM-dd');
    return { key: day, total: sumUsd(expenses.filter((e) => e.spentAt === day)) };
  });

  // Biggest first
  const categoryIds = [...new Set(expenses.map((e) => e.category.id))];
  const byCategory = categoryIds
    .map((id) => {
      const mine = expenses.filter((e) => e.category.id === id);
      return { category: mine[0].category, total: sumUsd(mine), count: mine.length };
    })
    .sort((a, b) => b.total - a.total || a.category.name.localeCompare(b.category.name));

  return {
    total,
    count: expenses.length,
    averagePerDay: daysCounted > 0 ? Math.round((total / daysCounted) * 100) / 100 : null,
    byCategory,
    series,
  };
}

const PERIOD_NAMES = { week: 'week', month: 'month' };

function PeriodNavigator({ period, onPeriodChange, rangeLabel, onPrevious, onNext, canGoNext }) {
  return (
    <div className={styles.navigator}>
      <div className={styles.periods}>
        <SegmentedControl
          label="Period"
          options={PERIOD_OPTIONS}
          value={period}
          onChange={onPeriodChange}
          fullWidth
        />
      </div>
      <div className={styles.range}>
        <IconButton icon={ChevronLeft} label={`Previous ${PERIOD_NAMES[period]}`} onClick={onPrevious} />
        {/* aria-live: screen readers announce the new range */}
        <h2 className={styles.title} aria-live="polite">
          {rangeLabel}
        </h2>
        <IconButton
          icon={ChevronRight}
          label={`Next ${PERIOD_NAMES[period]}`}
          onClick={onNext}
          disabled={!canGoNext}
        />
      </div>
    </div>
  );
}

function StatsRow({ summary }) {
  const { total, count, averagePerDay } = summary;
  return (
    <section className={styles.row} aria-label="Summary">
      <StatCard label="Total spent" value={formatMoney(total)} />
      <StatCard label="Average per day" value={averagePerDay === null ? '—' : formatMoney(averagePerDay)} />
      <StatCard label="Expenses" value={count} />
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} tabular-nums`}>{value}</p>
    </div>
  );
}

// SpendingBarChart
// Fixed label rhythm, so Recharts doesn't drop labels unevenly
function axisTicks(period, data) {
  if (period === 'week') return undefined;
  const last = data.at(-1)?.axisLabel;
  return ['1', '5', '10', '15', '20', '25', last].filter((label, i, all) => all.indexOf(label) === i);
}

// Short labels for the axis, full ones for the tooltip
function toChartData(period, series) {
  const today = todayISO();
  return series.map(({ key, total }) => ({
    key,
    total,
    axisLabel: period === 'week' ? formatDate(key, 'EEE') : formatDate(key, 'd'),
    fullLabel: formatDayLabel(key),
    isActive: key === today,
  }));
}

/** Grey bars; today's bar is blue. */
function SpendingBarChart({ period, series, total }) {
  const data = toChartData(period, series);
  const title = 'Spending by day';

  return (
    <Card title={title}>
      {total === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <>
          <div className={styles.chart} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              {/* No keyboard stop: screen readers get the table below instead */}
              <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} accessibilityLayer={false}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="axisLabel"
                  tickLine={false}
                  axisLine={false}
                  ticks={axisTicks(period, data)}
                  interval={0}
                />
                <YAxis
                  tickFormatter={formatCompactUsd}
                  tickLine={false}
                  axisLine={false}
                  width={CHART.yAxisWidth}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltip getLabel={(item) => item.payload.fullLabel} />}
                />
                <Bar
                  dataKey="total"
                  radius={CHART.barRadius}
                  maxBarSize={CHART.maxBarSize}
                  isAnimationActive={false}
                >
                  {data.map((row) => (
                    <Cell key={row.key} className={row.isActive ? styles.barActive : styles.spendingBarChartBar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Same numbers as the chart, for screen readers */}
          <table className="visually-hidden">
            <caption>{title}</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Spent</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((row) => row.total > 0)
                .map((row) => (
                  <tr key={row.key}>
                    <th scope="row">{row.fullLabel}</th>
                    <td>{formatMoney(row.total)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </Card>
  );
}

// Biggest first; each bar shows the category's share of the period total.
function TopCategories({ byCategory, total }) {
  const top = byCategory;

  return (
    <Card title="Spending by category">
      {top.length === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <ol className={styles.list}>
          {top.map(({ category, total: amount, count }) => (
            <li key={category.id} className={styles.item}>
              <CategoryIcon icon={category.icon} />
              <div className={styles.body}>
                <div className={styles.line}>
                  <span className="text-name">{category.name}</span>
                  <span className={`text-strong tabular-nums`}>{formatMoney(amount)}</span>
                </div>
                <div className={styles.track} aria-hidden="true">
                  <span
                    className={styles.fill}
                    style={{ width: `${(amount / total) * 100}%` }}
                  />
                </div>
                <span className="text-meta">
                  {formatShare(amount, total)} · {count} {count === 1 ? 'expense' : 'expenses'}
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

// ChartTooltip and ChartEmpty
// Small pieces shared by the charts

/** Recharts tooltip. `getLabel(item)` returns the text shown under the value. */
function ChartTooltip({ active, payload, getLabel }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className={styles.tooltip}>
      <span className={`${styles.tooltipValue} tabular-nums`}>{formatMoney(item.value)}</span>
      <span className={styles.tooltipLabel}>{getLabel(item)}</span>
    </div>
  );
}

/** Message shown instead of a chart when there's nothing to draw. */
function ChartEmpty({ children }) {
  return <p className={styles.empty}>{children}</p>;
}
