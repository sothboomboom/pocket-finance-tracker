import { useMemo } from 'react';
import { Plus, Receipt, SearchX } from 'lucide-react';
import { PageHeader, Fab } from '../components/Layout.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/Feedback.jsx';
import { ExpenseList, ExpenseFilters, MonthNavigator } from '../features/ExpenseList.jsx';
import { AddExpenseSheet } from '../features/ExpenseForm.jsx';
import { useExpenseFilters } from '../hooks/useExpenseFilters.js';
import { useCategories, useExpenses } from '../hooks/useData.js';
import { useSheet } from '../hooks/useSheet.js';
import { useToast } from '../context/ToastContext.js';
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

  const { expenses, createExpense } = useExpenses({
    ...range,
    categoryId: filters.categoryId,
    paymentMethod: filters.paymentMethod,
  });

  const goToMonth = (direction) => setFilter('month', shiftPeriod('month', firstDay, direction).slice(0, 7));

  function handleCreate(values) {
    createExpense(values);
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
          onCategoryChange={(id) => setFilter('category', id)}
          onMethodChange={(method) => setFilter('method', method)}
        />
      </div>

      <section aria-label="Expenses" className={styles.results}>
        {count > 0 && (
          <p className={styles.summary} aria-live="polite">
            <span className={`${styles.total} tabular-nums`}>{formatMoney(sumUsd(expenses))}</span>
            <span>
              {count} {count === 1 ? 'expense' : 'expenses'}
              {hasFilters && ' match your filters'}
            </span>
          </p>
        )}

        {count === 0 && hasFilters && (
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
        {count === 0 && !hasFilters && (
          <EmptyState icon={Receipt} message={`No expenses in ${monthLabel}.`} />
        )}
        {count > 0 && <ExpenseList expenses={expenses} />}
      </section>

      <Fab label="Add expense" onClick={sheet.openSheet} />

      <AddExpenseSheet open={sheet.open} session={sheet.session} onClose={sheet.closeSheet} onCreate={handleCreate} />
    </div>
  );
}
