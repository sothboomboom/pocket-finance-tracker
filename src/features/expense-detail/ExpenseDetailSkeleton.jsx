import Skeleton from '../../components/Skeleton.jsx';
import styles from './ExpenseDetailSkeleton.module.css';

// Same shape as the real page, so nothing jumps when it loads.
export default function ExpenseDetailSkeleton() {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-label="Loading expense">
      <div className={styles.card}>
        <Skeleton className={styles.circle} />
        <Skeleton className={styles.amount} />
        <Skeleton className={styles.button} />
      </div>
      <div className={styles.card}>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className={styles.line} />
        ))}
      </div>
    </div>
  );
}
