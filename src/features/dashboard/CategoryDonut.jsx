import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card.jsx';
import ChartTooltip from '../../components/ChartTooltip.jsx';
import ChartEmpty from './ChartEmpty.jsx';
import { formatMoney, formatShare } from '../../utils/money.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { CHART } from '../../constants/chart.js';
import styles from './CategoryDonut.module.css';

const chartColor = (color) => `var(--cat-${color}-chart, var(--cat-gray-chart))`;

/**
 * Slices use their category's color, never a color by rank, so Food is always orange.
 * The legend lists names and amounts, so nothing depends on telling colors apart.
 */
export default function CategoryDonut({ byCategory, total }) {
  const reducedMotion = useReducedMotion();
  const data = byCategory.map((row) => ({
    id: row.category.id,
    name: row.category.name,
    color: row.category.color,
    total: row.total,
  }));

  return (
    <Card title="Spending by category" className={styles.card}>
      {data.length === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <div className={styles.layout}>
          {/* Hidden from screen readers: the legend has the same information */}
          <div className={styles.chart} aria-hidden="true">
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

          <ul className={styles.legend}>
            {data.map((slice) => (
              <li key={slice.id} className={styles.row}>
                <span className={styles.swatch} style={{ backgroundColor: chartColor(slice.color) }} aria-hidden="true" />
                <span className={styles.name}>{slice.name}</span>
                <span className={`${styles.amount} tabular-nums`}>{formatMoney(slice.total)}</span>
                <span className={`${styles.share} tabular-nums`}>{formatShare(slice.total, total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
