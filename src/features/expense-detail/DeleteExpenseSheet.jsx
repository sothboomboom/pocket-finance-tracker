import { Trash2 } from 'lucide-react';
import ConfirmSheet from '../../components/ConfirmSheet.jsx';
import { formatMoney } from '../../utils/money.js';
import styles from './DeleteExpenseSheet.module.css';

export default function DeleteExpenseSheet({ open, session, expense, onClose, onConfirm }) {
  return (
    <ConfirmSheet
      open={open}
      session={session}
      title="Delete expense?"
      onClose={onClose}
      onConfirm={onConfirm}
      confirmLabel="Delete expense"
      confirmIcon={Trash2}
      loadingText="Deleting…"
    >
      <p>
        <strong className={styles.what}>
          {expense.note || expense.category.name} · {formatMoney(expense.amountUsd)}
        </strong>{' '}
        will be removed. You can undo this for a few seconds.
      </p>
    </ConfirmSheet>
  );
}
