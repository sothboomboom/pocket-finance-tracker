import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconButton } from '../components/Button.jsx';
import { DASHBOARD_PERIOD_OPTIONS } from '../constants/expenses.js';
import { formatMoney, formatShare, formatCompactUsd } from '../utils/money.js';
import { Card, SegmentedControl, CategoryIcon } from '../components/UI.jsx';
import { formatISO, todayISO, formatDayLabel } from '../utils/dates.js';
import { CHART } from '../constants/ui.js';
import styles from './Dashboard.module.css';

// The Dashboard pieces

//////////////////////////////
// PeriodNavigator
//////////////////////////////

const PERIOD_NAMES = { week: 'week', month: 'month' };

export function PeriodNavigator({ period, onPeriodChange, rangeLabel, onPrevious, onNext, canGoNext }) {
  return (
    <div className={styles.navigator}>
      <div className={styles.periods}>
        <SegmentedControl
          label="Period"
          options={DASHBOARD_PERIOD_OPTIONS}
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

//////////////////////////////
// StatsRow
//////////////////////////////

export function StatsRow({ summary }) {
  const { total, count, averagePerDay } = summary;
  return (
    <section className={styles.row} aria-label="Summary">
      <StatCard label="Total spent" value={formatMoney(total)} />
      <StatCard label="Average per day" value={averagePerDay === null ? '—' : formatMoney(averagePerDay)} />
      <StatCard label="Expenses" value={count} />
    </section>
  );
}

//////////////////////////////
// StatCard
//////////////////////////////

function StatCard({ label, value }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} tabular-nums`}>{value}</p>
    </div>
  );
}

//////////////////////////////
// SpendingBarChart
//////////////////////////////

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
    axisLabel: period === 'week' ? formatISO(key, 'EEE') : formatISO(key, 'd'),
    fullLabel: formatDayLabel(key),
    isActive: key === today,
  }));
}

/** Grey bars; today's bar is blue. */
export function SpendingBarChart({ period, series, total }) {
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

//////////////////////////////
// TopCategories
//////////////////////////////

// Biggest first; each bar shows the category's share of the period total.
export function TopCategories({ byCategory, total }) {
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

//////////////////////////////
// ChartTooltip and ChartEmpty
//////////////////////////////

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
