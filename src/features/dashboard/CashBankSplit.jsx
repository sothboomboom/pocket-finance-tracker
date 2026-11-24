import { formatMoney, formatShare } from '../../utils/money.js';
import styles from './CashBankSplit.module.css';

// The amounts are text; the bar is only a quick visual.
export default function CashBankSplit({ cash, bank }) {
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
          <li key={part.key} className={styles.row}>
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
