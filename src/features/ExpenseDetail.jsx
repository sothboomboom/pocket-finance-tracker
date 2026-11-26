import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '../components/Button.jsx';
import { formatMoney } from '../utils/money.js';
import { BASE_CURRENCY } from '../constants/currencies.js';
import { Card, Tag, CategoryIcon } from '../components/UI.jsx';
import { formatISO } from '../utils/dates.js';
import { ConfirmSheet } from '../components/Sheet.jsx';
import styles from './ExpenseDetail.module.css';

// The pieces of one expense's page.

//////////////////////////////
// ExpenseHero
//////////////////////////////

export function ExpenseHero({ expense, onEdit, onDelete }) {
  const { amountUsd, amount, currency, category, paymentMethod } = expense;
  const isForeign = currency !== BASE_CURRENCY;

  return (
    <section className={styles.hero} aria-label="Amount">
      <div className={styles.top}>
        <CategoryIcon icon={category.icon} size="md" />
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

//////////////////////////////
// ExpenseFacts
//////////////////////////////

const formatTimestamp = (iso) => format(new Date(iso), "MMM d, yyyy 'at' h:mm a");

export function ExpenseFacts({ expense }) {
  const { category, spentAt, paymentMethod, note, currency, rateToUsd, createdAt, updatedAt } = expense;
  const wasEdited = updatedAt !== createdAt;

  const facts = [
    {
      label: 'Category',
      // Opens All expenses filtered to this category.
      value: <Link to={`/expenses?category=${category.id}`}>{category.name}</Link>,
    },
    { label: 'Date', value: formatISO(spentAt, 'EEEE, MMMM d, yyyy') },
    { label: 'Paid with', value: paymentMethod === 'cash' ? 'Cash' : 'Bank' },
    { label: 'Note', value: note ?? <span className={styles.empty}>No note</span> },
  ];
  if (currency !== BASE_CURRENCY) {
    facts.push({
      label: 'Exchange rate',
      value: `$1 = ${formatMoney(1 / rateToUsd, currency)} (saved with this expense)`,
    });
  }
  facts.push({ label: 'Recorded', value: formatTimestamp(createdAt) });
  if (wasEdited) facts.push({ label: 'Last edited', value: formatTimestamp(updatedAt) });

  return (
    <Card title="Details">
      <dl className={styles.list}>
        {facts.map(({ label, value }) => (
          <div key={label} className={styles.row}>
            <dt className="text-meta">{label}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

//////////////////////////////
// DeleteExpenseSheet
//////////////////////////////

export function DeleteExpenseSheet({ open, session, expense, onClose, onConfirm }) {
  return (
    <ConfirmSheet
      open={open}
      session={session}
      title="Delete expense?"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel="Delete expense"
      confirmIcon={Trash2}
    >
      <p>
        <strong className={styles.what}>
          {expense.note || expense.category.name} · {formatMoney(expense.amountUsd)}
        </strong>{' '}
        will be removed. This can't be undone.
      </p>
    </ConfirmSheet>
  );
}
