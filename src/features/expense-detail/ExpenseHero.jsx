import { Pencil, Trash2 } from 'lucide-react';
import { Tag, CategoryIcon } from '../../components/UI.jsx';
import { Button } from '../../components/Button.jsx';
import { formatMoney } from '../../utils/money.js';
import { BASE_CURRENCY } from '../../constants/currencies.js';
import styles from './ExpenseHero.module.css';

export default function ExpenseHero({ expense, onEdit, onDelete }) {
  const { amountUsd, amount, currency, category, paymentMethod } = expense;
  const isForeign = currency !== BASE_CURRENCY;

  return (
    <section className={styles.hero} aria-label="Amount">
      <div className={styles.top}>
        <CategoryIcon icon={category.icon} color={category.color} size="md" />
        <Tag>{paymentMethod === 'cash' ? 'Cash' : 'Bank'}</Tag>
      </div>

      <div className={styles.amounts}>
        <p className={`${styles.amount} tabular-nums`}>{formatMoney(amountUsd)}</p>
        {isForeign && (
          <p className={`${styles.original} tabular-nums`}>Paid {formatMoney(amount, currency)}</p>
        )}
      </div>

      <div className={styles.actions}>
        <Button icon={Pencil} onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" icon={Trash2} onClick={onDelete}>
          Delete
        </Button>
      </div>
    </section>
  );
}
