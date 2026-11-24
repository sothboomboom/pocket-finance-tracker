import { formatMoney } from '../utils/money.js';
import styles from './ChartTooltip.module.css';

/** Recharts tooltip. `getLabel(item)` returns the text shown under the value. */
export default function ChartTooltip({ active, payload, getLabel }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className={styles.tooltip}>
      <span className={`${styles.value} tabular-nums`}>{formatMoney(item.value)}</span>
      <span className={styles.label}>{getLabel(item)}</span>
    </div>
  );
}
