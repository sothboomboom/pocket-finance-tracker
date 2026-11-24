import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card.jsx';
import ChartTooltip from '../../components/ChartTooltip.jsx';
import ChartEmpty from './ChartEmpty.jsx';
import { formatCompactUsd, formatMoney } from '../../utils/money.js';
import { formatHourShort, formatHourRange, formatISO, todayISO, formatDayLabel } from '../../utils/dates.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { CHART } from '../../constants/chart.js';
import styles from './SpendingBarChart.module.css';

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
export default function SpendingBarChart({ period, series, date, total }) {
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
                    <Cell key={row.key} className={row.isActive ? styles.barActive : styles.bar} />
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
