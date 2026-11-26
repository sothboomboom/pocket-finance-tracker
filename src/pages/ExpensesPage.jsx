import { useMemo } from 'react';
import { Plus, Receipt, SearchX } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { Button } from '../components/Button.jsx';
import Fab from '../components/Fab.jsx';
import { EmptyState, ErrorState } from '../components/Feedback.jsx';
import ExpenseList from '../features/expenses/ExpenseList.jsx';
import ExpenseListSkeleton from '../features/expenses/ExpenseListSkeleton.jsx';
import AddExpenseSheet from '../features/expenses/AddExpenseSheet.jsx';
import MonthNavigator from '../features/expense-history/MonthNavigator.jsx';
import ExpenseFilters from '../features/expense-history/ExpenseFilters.jsx';
import { useExpenses } from '../hooks/useExpenses.js';
import { useExpenseFilters } from '../hooks/useExpenseFilters.js';
import { useCategories } from '../hooks/useCategories.js';
import { useSheet } from '../hooks/useSheet.js';
import { useToast } from '../hooks/useToast.js';
import { getPeriodRange, shiftPeriod, formatISO } from '../utils/dates.js';
import { formatMoney, sumUsd } from '../utils/money.js';
import styles from './ExpensesPage.module.css';

export default function ExpensesPage() {
  const { filters, setFilter, clearFilters, hasFilters, isThisMonth } = useExpenseFilters();
  const { categories } = useCategories();
  const sheet = useSheet();
  const { showToast } = useToast();

  const firstDay = `${filters.month}-01`;
  const range = useMemo(() => getPeriodRange('month', new Date(`${firstDay}T00:00:00`)), [firstDay]);
  const monthLabel = formatISO(firstDay, 'MMMM yyyy');

  const { expenses, status, error, reload, isRefreshing, createExpense } = useExpenses({
    ...range,
    categoryId: filters.categoryId,
    paymentMethod: filters.paymentMethod,
    q: filters.q,
  });

  const goToMonth = (direction) => setFilter('month', shiftPeriod('month', firstDay, direction).slice(0, 7));

  async function handleCreate(values) {
    await createExpense(values);
    showToast({ message: 'Expense added' });
    sheet.closeSheet();
  }

  const count = expenses.length;

  return (
    <div className={styles.page}>
      <PageHeader
        title="All expenses"
        actions={
          <div className={styles.headerAction}>
            <Button icon={Plus} onClick={sheet.openSheet}>
              Add expense
            </Button>
          </div>
        }
      />

      <div className={styles.controls}>
        <MonthNavigator
          label={monthLabel}
          onPrevious={() => goToMonth(-1)}
          onNext={() => goToMonth(1)}
          canGoNext={!isThisMonth}
        />
        <ExpenseFilters
          filters={filters}
          categories={categories}
          // replace: Back shouldn't undo the search letter by letter
          onSearchChange={(q) => setFilter('q', q, { replace: true })}
          onCategoryChange={(id) => setFilter('category', id)}
          onMethodChange={(method) => setFilter('method', method)}
        />
      </div>

      <section
        aria-label="Expenses"
        aria-busy={isRefreshing}
        className={`${styles.results} ${isRefreshing ? styles.refreshing : ''}`}
      >
        {status === 'success' && count > 0 && (
          <p className={styles.summary} aria-live="polite">
            <span className={`${styles.total} tabular-nums`}>{formatMoney(sumUsd(expenses))}</span>
            <span>
              {count} {count === 1 ? 'expense' : 'expenses'}
              {hasFilters && ' match your filters'}
            </span>
          </p>
        )}

        {status === 'loading' && <ExpenseListSkeleton rows={5} />}
        {status === 'error' && <ErrorState message={error?.message} onRetry={reload} />}
        {status === 'success' && count === 0 && hasFilters && (
          <EmptyState
            icon={SearchX}
            message={`No expenses in ${monthLabel} match these filters.`}
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
        {status === 'success' && count === 0 && !hasFilters && (
          <EmptyState icon={Receipt} message={`No expenses in ${monthLabel}.`} />
        )}
        {status === 'success' && count > 0 && <ExpenseList expenses={expenses} />}
      </section>

      <Fab label="Add expense" onClick={sheet.openSheet} />

      <AddExpenseSheet open={sheet.open} session={sheet.session} onClose={sheet.closeSheet} onCreate={handleCreate} />
    </div>
  );
}
