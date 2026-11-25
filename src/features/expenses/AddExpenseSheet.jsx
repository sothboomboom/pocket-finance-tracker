import ExpenseSheet from './ExpenseSheet.jsx';
import { useCategories } from '../../hooks/useCategories.js';

/** Used by Home and All expenses. Editing happens on the expense's own page. */
export default function AddExpenseSheet({ open, session, onClose, onCreate }) {
  const { categories, status, reload } = useCategories();
  return (
    <ExpenseSheet
      open={open}
      session={session}
      expense={null}
      onClose={onClose}
      categories={categories}
      categoriesStatus={status}
      onRetryCategories={reload}
      onSubmit={onCreate}
    />
  );
}
