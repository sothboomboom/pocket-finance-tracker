import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Pencil, SearchX, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../components/Layout.jsx';
import { Button, BackButton } from '../components/Button.jsx';
import { Placeholder } from '../components/Feedback.jsx';
import { Card, Tag, CategoryIcon } from '../components/UI.jsx';
import { ConfirmSheet } from '../components/Sheet.jsx';
import { ExpenseSheet } from '../components/ExpenseForm.jsx';
import { useFinance } from '../context/useFinance.js';
import { BASE_CURRENCY } from '../data/currencies.js';
import { formatDayLabel, formatDate } from '../utils/dates.js';
import { formatMoney } from '../utils/money.js';
import styles from './ExpenseDetailPage.module.css';

export default function ExpenseDetailPage() {
  // From the URL: /expenses/12 -> '12'
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getExpense, updateExpense, deleteExpense } = useFinance();
  const expense = getExpense(id);
  // Which sheet is open: 'edit', 'delete' or null
  const [sheet, setSheet] = useState(null);
  // Set while leaving after a delete, so "not found" doesn't flash for a moment
  const [deleted, setDeleted] = useState(false);

  function handleSave(values) {
    updateExpense(id, values);
    setSheet(null);
  }

  function handleConfirmDelete() {
    setDeleted(true);
    deleteExpense(id);
    // Back to where the user came from; /expenses if the page was opened directly.
    if (location.key !== 'default') navigate(-1);
    else navigate('/expenses', { replace: true });
  }

  const backButton = <BackButton fallback="/expenses" label="Back to expenses" />;

  if (!expense) {
    if (deleted) return null;
    return (
      <div className={styles.page}>
        <div className={styles.back}>{backButton}</div>
        <PageHeader title="Expense not found" />
        <Placeholder icon={SearchX}>
          This expense doesn't exist. It may have been deleted. <Link to="/expenses">See all expenses</Link>
        </Placeholder>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.back}>{backButton}</div>

      <PageHeader eyebrow={formatDayLabel(expense.spentAt)} title={expense.note || expense.category.name} />
      <div className={styles.sections}>
        <ExpenseHero expense={expense} onEdit={() => setSheet('edit')} onDelete={() => setSheet('delete')} />
        <ExpenseFacts expense={expense} />
      </div>

      {/* The edit form's Delete button hands over to the confirmation sheet. */}
      <ExpenseSheet
        open={sheet === 'edit'}
        expense={expense}
        onClose={() => setSheet(null)}
        onSubmit={handleSave}
        onDelete={() => setSheet('delete')}
      />
      <DeleteExpenseSheet
        open={sheet === 'delete'}
        expense={expense}
        onClose={() => setSheet(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function ExpenseHero({ expense, onEdit, onDelete }) {
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

const formatTimestamp = (iso) => format(new Date(iso), "MMM d, yyyy 'at' h:mm a");

function ExpenseFacts({ expense }) {
  const { category, spentAt, paymentMethod, note, currency, rateToUsd, createdAt, updatedAt } = expense;
  const wasEdited = updatedAt !== createdAt;

  const facts = [
    {
      label: 'Category',
      // Opens All expenses filtered to this category.
      value: <Link to={`/expenses?category=${category.id}`}>{category.name}</Link>,
    },
    { label: 'Date', value: formatDate(spentAt, 'EEEE, MMMM d, yyyy') },
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

function DeleteExpenseSheet({ open, expense, onClose, onConfirm }) {
  return (
    <ConfirmSheet
      open={open}
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
