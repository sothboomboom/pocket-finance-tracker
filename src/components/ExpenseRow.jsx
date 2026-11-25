import { Link } from 'react-router-dom';
import CategoryIcon from './CategoryIcon.jsx';
import Tag from './Tag.jsx';
import { formatMoney } from '../utils/money.js';
import { BASE_CURRENCY } from '../constants/currencies.js';
import styles from './ExpenseRow.module.css';

// A link, not a button: it navigates, so open-in-new-tab works.
export default function ExpenseRow({ expense }) {
  const { id, note, category, paymentMethod, amountUsd, amount, currency } = expense;
  const isForeign = currency !== BASE_CURRENCY;

  return (
    <Link to={`/expenses/${id}`} className={styles.row}>
      <CategoryIcon icon={category.icon} color={category.color} />

      <span className={styles.main}>
        <span className={styles.title}>{note || category.name}</span>
        <span className={styles.meta}>
          <Tag>{paymentMethod === 'cash' ? 'Cash' : 'Bank'}</Tag>
          {/* The note takes the title, so the category name moves here */}
          {note && <span className={styles.secondary}>{category.name}</span>}
        </span>
      </span>

      <span className={styles.amounts}>
        <span className={`${styles.amount} tabular-nums`}>{formatMoney(amountUsd)}</span>
        {isForeign && (
          <span className={`${styles.secondary} tabular-nums`}>
            ≈ {formatMoney(amountUsd)} · {formatMoney(amount, currency)}
          </span>
        )}
      </span>
    </Link>
  );
}
