import { ChevronLeft, ChevronRight, ArrowDown, ArrowUp, Equal, Minus } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { IconButton } from '../components/Button.jsx';
import { DASHBOARD_PERIOD_OPTIONS } from '../constants/expenses.js';
import { formatMoney, formatShare, formatCompactUsd } from '../utils/money.js';
import { Card, SegmentedControl, CategoryIcon } from '../components/UI.jsx';
import { formatHourShort, formatHourRange, formatISO, todayISO, formatDayLabel } from '../utils/dates.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { CHART } from '../constants/ui.js';
import styles from './Dashboard.module.css';

// The Dashboard pieces. Only DashboardPage imports this file, so the chart library loads with that page only.

//////////////////////////////
// PeriodNavigator
//////////////////////////////

const PERIOD_NAMES = { day: 'day', week: 'week', month: 'month' };

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

export function StatsRow({ summary, period, isCurrentPeriod }) {
  const { total, count, averagePerDay, previousTotal, paymentSplit } = summary;

  // In the Daily view "average per day" would equal the total, so show the average expense.
  const average =
    period === 'day'
      ? { label: 'Average per expense', value: count > 0 ? formatMoney(total / count) : '—' }
      : { label: 'Average per day', value: averagePerDay === null ? '—' : formatMoney(averagePerDay) };

  return (
    <section className={styles.row} aria-label="Summary">
      <StatCard label="Total spent" value={formatMoney(total)}>
        <PeriodComparison
          total={total}
          previousTotal={previousTotal}
          period={period}
          isCurrentPeriod={isCurrentPeriod}
        />
      </StatCard>
      <StatCard label={average.label} value={average.value} />
      <StatCard label="Expenses" value={count} />
      <StatCard label="Cash vs bank" value={total > 0 ? `${Math.round((paymentSplit.cash / total) * 100)}% cash` : '—'}>
        <CashBankSplit cash={paymentSplit.cash} bank={paymentSplit.bank} />
      </StatCard>
    </section>
  );
}

//////////////////////////////
// StatCard
//////////////////////////////

// One card: label, big value, optional detail underneath
function StatCard({ label, value, children }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} tabular-nums`}>{value}</p>
      {children && <div className={styles.detail}>{children}</div>}
    </div>
  );
}

//////////////////////////////
// PeriodComparison
//////////////////////////////

const PREVIOUS_NAMES = {
  current: { day: 'yesterday', week: 'last week', month: 'last month' },
  past: { day: 'the day before', week: 'the week before', month: 'the month before' },
};

/** "↓ 12% vs last week". The arrow and words carry the meaning; color only tints the icon. */
function PeriodComparison({ total, previousTotal, period, isCurrentPeriod }) {
  const previousName = PREVIOUS_NAMES[isCurrentPeriod ? 'current' : 'past'][period];

  let Icon;
  let text;
  let tone = 'neutral';
  if (previousTotal === 0) {
    if (total === 0) return null;
    Icon = Minus;
    text = `Nothing spent ${previousName}`;
  } else {
    const change = Math.round(((total - previousTotal) / previousTotal) * 100);
    if (change === 0) {
      Icon = Equal;
      text = `Same as ${previousName}`;
    } else {
      Icon = change < 0 ? ArrowDown : ArrowUp;
      tone = change < 0 ? 'down' : 'up';
      text = (
        <>
          <span className="visually-hidden">{change < 0 ? 'Down' : 'Up'} </span>
          {Math.abs(change)}% vs {previousName}
        </>
      );
    }
  }

  return (
    <p className={styles.comparison}>
      <Icon className={`${styles.icon} ${styles[tone]}`} strokeWidth={2.5} aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}

//////////////////////////////
// CashBankSplit
//////////////////////////////

// The amounts are text; the bar is only a quick visual.
function CashBankSplit({ cash, bank }) {
  const total = cash + bank;
  const parts = [
    { key: 'cash', label: 'Cash', amount: cash },
    { key: 'bank', label: 'Bank', amount: bank },
  ];

  return (
    <div className={styles.split}>
      <div className={styles.bar} aria-hidden="true">
        {total > 0 &&
          parts.map(
            (part) =>
              part.amount > 0 && (
                <span key={part.key} className={`${styles.part} ${styles[part.key]}`} style={{ flexGrow: part.amount }} />
              ),
          )}
      </div>
      <ul className={styles.legend}>
        {parts.map((part) => (
          <li key={part.key} className={styles.cashBankSplitRow}>
            <span className={`${styles.swatch} ${styles[part.key]}`} aria-hidden="true" />
            <span className={styles.name}>{part.label}</span>
            <span className={`${styles.amount} tabular-nums`}>
              {formatMoney(part.amount)} · {formatShare(part.amount, total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

//////////////////////////////
// SpendingBarChart
//////////////////////////////

const TITLES = { day: 'Spending by hour', week: 'Spending by day', month: 'Spending by day' };

// Fixed label rhythm, so Recharts doesn't drop labels unevenly.
function axisTicks(period, data) {
  if (period === 'week') return undefined;
  if (period === 'day') return data.filter((row) => row.key % 3 === 0).map((row) => row.axisLabel);
  const last = data.at(-1)?.axisLabel;
  return ['1', '5', '10', '15', '20', '25', last].filter((label, i, all) => all.indexOf(label) === i);
}

// Short labels for the axis, full ones for the tooltip.
function toChartData(period, series, date) {
  const today = todayISO();
  const currentHour = new Date().getHours();
  return series.map(({ key, total }) => {
    if (period === 'day') {
      return {
        key,
        total,
        axisLabel: formatHourShort(key),
        fullLabel: formatHourRange(key),
        isActive: date === today && key === currentHour,
      };
    }
    return {
      key,
      total,
      axisLabel: period === 'week' ? formatISO(key, 'EEE') : formatISO(key, 'd'),
      fullLabel: formatDayLabel(key),
      isActive: key === today,
    };
  });
}

/** One neutral color for all bars; only the current day or hour is blue, as the active one. */
export function SpendingBarChart({ period, series, date, total }) {
  const reducedMotion = useReducedMotion();
  const data = toChartData(period, series, date);
  const title = TITLES[period];

  return (
    <Card title={title} subtitle={period === 'day' ? 'By the time each expense was added' : undefined}>
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
                  isAnimationActive={!reducedMotion}
                  animationDuration={CHART.animationMs}
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
                <th scope="col">{period === 'day' ? 'Hour' : 'Day'}</th>
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
// CategoryDonut
//////////////////////////////

const chartColor = (color) => `var(--cat-${color}-chart, var(--cat-gray-chart))`;

/**
 * Slices use their category's color, never a color by rank, so Food is always orange.
 * The legend lists names and amounts, so nothing depends on telling colors apart.
 */
export function CategoryDonut({ byCategory, total }) {
  const reducedMotion = useReducedMotion();
  const data = byCategory.map((row) => ({
    id: row.category.id,
    name: row.category.name,
    color: row.category.color,
    total: row.total,
  }));

  return (
    <Card title="Spending by category">
      {data.length === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <div className={styles.layout}>
          {/* Hidden from screen readers: the legend has the same information */}
          <div className={styles.categoryDonutChart} aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart accessibilityLayer={false}>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="name"
                  innerRadius="64%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={!reducedMotion}
                  animationDuration={CHART.animationMs}
                  className={styles.pie}
                  rootTabIndex={-1}
                >
                  {data.map((slice) => (
                    <Cell key={slice.id} style={{ fill: chartColor(slice.color) }} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip getLabel={(item) => `${item.name} · ${formatShare(item.value, total)}`} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className={styles.categoryDonutLegend}>
            {data.map((slice) => (
              <li key={slice.id} className={styles.categoryDonutRow}>
                <span className={styles.categoryDonutSwatch} style={{ backgroundColor: chartColor(slice.color) }} aria-hidden="true" />
                <span className="text-name">{slice.name}</span>
                <span className={`text-strong tabular-nums`}>{formatMoney(slice.total)}</span>
                <span className={`${styles.share} tabular-nums`}>{formatShare(slice.total, total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

//////////////////////////////
// TopCategories
//////////////////////////////

const LIMIT = 5;

// Bars show each category's share of the period total.
export function TopCategories({ byCategory, total }) {
  const top = byCategory.slice(0, LIMIT);

  return (
    <Card title="Top categories">
      {top.length === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <ol className={styles.list}>
          {top.map(({ category, total: amount, count }) => (
            <li key={category.id} className={styles.item}>
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className={styles.body}>
                <div className={styles.line}>
                  <span className="text-name">{category.name}</span>
                  <span className={`text-strong tabular-nums`}>{formatMoney(amount)}</span>
                </div>
                <div className={styles.track} aria-hidden="true">
                  <span
                    className={styles.fill}
                    style={{
                      width: `${(amount / total) * 100}%`,
                      backgroundColor: `var(--cat-${category.color}-chart, var(--cat-gray-chart))`,
                    }}
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
// Small pieces shared by the dashboard charts.

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
