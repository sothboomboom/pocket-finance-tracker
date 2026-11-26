import { Card, CategoryIcon } from '../../components/UI.jsx';
import ChartEmpty from './ChartEmpty.jsx';
import { formatMoney, formatShare } from '../../utils/money.js';
import styles from './TopCategories.module.css';

const LIMIT = 5;

// Bars show each category's share of the period total.
export default function TopCategories({ byCategory, total }) {
  const top = byCategory.slice(0, LIMIT);

  return (
    <Card title="Top categories" className={styles.card}>
      {top.length === 0 ? (
        <ChartEmpty>No spending in this period.</ChartEmpty>
      ) : (
        <ol className={styles.list}>
          {top.map(({ category, total: amount, count }) => (
            <li key={category.id} className={styles.item}>
              <CategoryIcon icon={category.icon} color={category.color} />
              <div className={styles.body}>
                <div className={styles.line}>
                  <span className={styles.name}>{category.name}</span>
                  <span className={`${styles.amount} tabular-nums`}>{formatMoney(amount)}</span>
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
                <span className={styles.meta}>
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
