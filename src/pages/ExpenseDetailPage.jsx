import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PageHeader } from '../components/Layout.jsx';
import { BackButton } from '../components/Button.jsx';
import { Placeholder } from '../components/Feedback.jsx';
import { ExpenseSheet } from '../features/ExpenseForm.jsx';
import { ExpenseHero, ExpenseFacts, DeleteExpenseSheet } from '../features/ExpenseDetail.jsx';
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
  const { expense, updateExpense, deleteExpense } = useExpense(id);
  const { categories } = useCategories();
  const editSheet = useSheet();
  const deleteSheet = useSheet();
  const { showToast } = useToast();

  function handleSave(values) {
    updateExpense(values);
    showToast({ message: 'Changes saved' });
    editSheet.closeSheet();
  }

  // The edit form's Delete button hands over to the confirmation sheet.
  function handleDeleteFromEdit() {
    editSheet.closeSheet();
    deleteSheet.openSheet();
  }

  function handleConfirmDelete() {
    deleteExpense(() => {
      // Back to where the user came from; /expenses if the page was opened directly.
      if (location.key !== 'default') navigate(-1);
      else navigate('/expenses', { replace: true });
    });
    showToast({ message: 'Expense deleted' });
  }

  const backButton = <BackButton fallback="/expenses" label="Back to expenses" />;

  if (!expense) {
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
        <ExpenseHero expense={expense} onEdit={editSheet.openSheet} onDelete={deleteSheet.openSheet} />
        <ExpenseFacts expense={expense} />
      </div>

      <ExpenseSheet
        open={editSheet.open}
        session={editSheet.session}
        expense={expense}
        onClose={editSheet.closeSheet}
        categories={categories}
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
    </div>
  );
}
