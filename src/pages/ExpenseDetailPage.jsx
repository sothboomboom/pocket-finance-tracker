import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PageHeader } from '../components/Layout.jsx';
import { BackButton } from '../components/Button.jsx';
import { ErrorState, Placeholder } from '../components/Feedback.jsx';
import { ExpenseSheet } from '../features/ExpenseForm.jsx';
import { ExpenseHero, ExpenseFacts, DeleteExpenseSheet, ExpenseDetailSkeleton } from '../features/ExpenseDetail.jsx';
import ExpenseSheet from '../features/expenses/ExpenseSheet.jsx';
import ExpenseHero from '../features/expense-detail/ExpenseHero.jsx';
import ExpenseFacts from '../features/expense-detail/ExpenseFacts.jsx';
import ExpenseDetailSkeleton from '../features/expense-detail/ExpenseDetailSkeleton.jsx';
import DeleteExpenseSheet from '../features/expense-detail/DeleteExpenseSheet.jsx';
import { useCategories, useExpense } from '../hooks/useData.js';
import { useSheet } from '../hooks/useSheet.js';
import { useToast } from '../context/ToastContext.js';
import { formatDayLabel } from '../utils/dates.js';
import styles from './ExpenseDetailPage.module.css';

export default function ExpenseDetailPage() {
  // From the URL: /expenses/12 -> '12'
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { expense, status, error, notFound, reload, updateExpense, deleteExpense, restoreExpense } = useExpense(id);
  const categoriesState = useCategories();
  const editSheet = useSheet();
  const deleteSheet = useSheet();
  const { showToast } = useToast();

  async function handleSave(values) {
    await updateExpense(values);
    showToast({ message: 'Changes saved' });
    editSheet.closeSheet();
  }

  // The edit form's Delete button hands over to the confirmation sheet.
  function handleDeleteFromEdit() {
    editSheet.closeSheet();
    deleteSheet.openSheet();
  }

  async function handleConfirmDelete() {
    const deleted = expense; // kept for Undo
    await deleteExpense(() => {
      // Back to where the user came from; /expenses if the page was opened directly.
      if (location.key !== 'default') navigate(-1);
      else navigate('/expenses', { replace: true });
    });
    showToast({
      message: 'Expense deleted',
      action: {
        label: 'Undo',
        onClick: () =>
          restoreExpense(deleted)
            .then(() => showToast({ message: 'Expense restored' }))
            .catch((err) => showToast({ message: `Couldn't restore the expense. ${err.message}`, tone: 'error' })),
      },
    });
  }

  const backButton = <BackButton fallback="/expenses" label="Back to expenses" />;

  if (notFound) {
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

      {status === 'loading' && <ExpenseDetailSkeleton />}
      {status === 'error' && <ErrorState message={error?.message} onRetry={reload} />}
      {status === 'success' && (
        <>
          <PageHeader eyebrow={formatDayLabel(expense.spentAt)} title={expense.note || expense.category.name} />
          <div className={styles.sections}>
            <ExpenseHero expense={expense} onEdit={editSheet.openSheet} onDelete={deleteSheet.openSheet} />
            <ExpenseFacts expense={expense} />
          </div>

          <ExpenseSheet
            open={editSheet.open}
            session={editSheet.session}
            expense={expense}
            onClose={editSheet.closeSheet}
            categories={categoriesState.categories}
            categoriesStatus={categoriesState.status}
            onRetryCategories={categoriesState.reload}
            onSubmit={handleSave}
            onDelete={handleDeleteFromEdit}
          />
          <DeleteExpenseSheet
            open={deleteSheet.open}
            session={deleteSheet.session}
            expense={expense}
            onClose={deleteSheet.closeSheet}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </div>
  );
}
