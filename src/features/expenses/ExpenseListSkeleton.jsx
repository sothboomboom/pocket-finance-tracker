import { Skeleton } from '../../components/Feedback.jsx';
import styles from './ExpenseListSkeleton.module.css';

export default function ExpenseListSkeleton({ rows = 3 }) {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-label="Loading expenses">
      <Skeleton className={styles.day} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.row}>
          <Skeleton className={styles.circle} />
          <div className={styles.lines}>
            <Skeleton className={styles.line} />
            <Skeleton className={styles.lineShort} />
          </div>
          <Skeleton className={styles.amount} />
        </div>
      ))}
    </div>
  );
}
