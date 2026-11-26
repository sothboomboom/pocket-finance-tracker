import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card } from '../../components/UI.jsx';
import { formatMoney } from '../../utils/money.js';
import { formatISO } from '../../utils/dates.js';
import { BASE_CURRENCY } from '../../constants/currencies.js';
import styles from './ExpenseFacts.module.css';

const formatTimestamp = (iso) => format(new Date(iso), "MMM d, yyyy 'at' h:mm a");

export default function ExpenseFacts({ expense }) {
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
            <dt className={styles.label}>{label}</dt>
            <dd className={styles.value}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
