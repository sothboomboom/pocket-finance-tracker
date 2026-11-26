import { Skeleton } from '../../components/Feedback.jsx';
import { formatMoney } from '../../utils/money.js';
import { useCountUp } from '../../hooks/useCountUp.js';
import styles from './HeroTotal.module.css';

const LABELS = { day: 'Spent today', week: 'Spent this week', month: 'Spent this month' };

export default function HeroTotal({ period, total, count, rangeLabel, loading }) {
  const animatedTotal = useCountUp(total);
  return (
    <div className={styles.hero}>
      <p className="eyebrow">{LABELS[period]}</p>
      {loading ? (
        <Skeleton className={styles.amountSkeleton} />
      ) : (
        <p className={`${styles.amount} tabular-nums`}>
          {/* Screen readers hear the final number once, not every animation frame */}
          <span aria-hidden="true">{formatMoney(animatedTotal)}</span>
          <span className="visually-hidden">{formatMoney(total)}</span>
        </p>
      )}
      <p className={styles.meta}>
        {rangeLabel}
        {!loading && ` · ${count} ${count === 1 ? 'expense' : 'expenses'}`}
      </p>
    </div>
  );
}
