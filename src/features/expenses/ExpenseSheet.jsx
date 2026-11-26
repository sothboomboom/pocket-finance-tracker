import { useEffect, useRef } from 'react';
import { Sheet } from '../../components/Sheet.jsx';
import ExpenseForm from './ExpenseForm.jsx';
import { useRates } from '../../hooks/useRates.js';

/** `session` changes on every open, which remounts the form so it starts fresh. */
export default function ExpenseSheet({ open, session, expense, onClose, ...formProps }) {
  const amountRef = useRef(null);
  const { rates, status: ratesStatus, reload: reloadRates } = useRates();

  // Refresh rates on every open; cached rates stay on screen meanwhile.
  useEffect(() => {
    if (session > 1) reloadRates();
  }, [session, reloadRates]);

  return (
    <Sheet open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'} initialFocusRef={amountRef}>
      <ExpenseForm
        key={session}
        expense={expense}
        amountRef={amountRef}
        rates={rates}
        ratesStatus={ratesStatus}
        {...formProps}
      />
    </Sheet>
  );
}
