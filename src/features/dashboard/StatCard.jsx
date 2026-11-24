import styles from './StatCard.module.css';

export default function StatCard({ label, value, children }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} tabular-nums`}>{value}</p>
      {children && <div className={styles.detail}>{children}</div>}
    </div>
  );
}
