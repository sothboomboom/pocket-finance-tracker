import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Receipt, SearchX } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, Fab } from '../components/Layout.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/Feedback.jsx';
import { ExpenseList, ExpenseFilters, MonthNavigator } from '../components/ExpenseList.jsx';
import { ExpenseSheet } from '../components/ExpenseForm.jsx';
import { useFinance } from '../context/useFinance.js';
import { getPeriodRange, shiftPeriod, formatDate } from '../utils/dates.js';
import { formatMoney, sumUsd } from '../utils/money.js';
import styles from './ExpensesPage.module.css';

// Filters in the URL
// The filters live in the URL (?month=2026-10&category=3&method=cash),
// so the back button and shared links keep them.
function readFilters(searchParams) {
  const month = searchParams.get('month');
  const categoryId = Number(searchParams.get('category'));
  const method = searchParams.get('method');
  return {
    month: /^\d{4}-(0[1-9]|1[0-2])$/.test(month ?? '') ? month : thisMonth(),
    categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null,
    paymentMethod: ['cash', 'bank'].includes(method) ? method : null,
  };
}

const thisMonth = () => format(new Date(), 'yyyy-MM');

export default function ExpensesPage() {
  const { categories, listExpenses, createExpense } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = readFilters(searchParams);
  const hasFilters = filters.categoryId !== null || filters.paymentMethod !== null;

  // An empty value removes the filter
  function setFilter(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null || value === '') next.delete(key);
      else next.set(key, String(value));
      return next;
    });
  }

  // Clears category and method, but keeps the month
  function clearFilters() {
    setSearchParams((prev) => (prev.get('month') ? { month: prev.get('month') } : {}));
  }

  const firstDay = `${filters.month}-01`;
  const range = getPeriodRange('month', new Date(`${firstDay}T00:00:00`));
  const monthLabel = formatDate(firstDay, 'MMMM yyyy');
  const goToMonth = (direction) => setFilter('month', shiftPeriod('month', firstDay, direction).slice(0, 7));

  const expenses = listExpenses({ ...range, categoryId: filters.categoryId, paymentMethod: filters.paymentMethod });
  const count = expenses.length;

  function handleCreate(values) {
    createExpense(values);
    setSheetOpen(false);
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="All expenses"
        actions={
          <div className={styles.headerAction}>
            <Button icon={Plus} onClick={() => setSheetOpen(true)}>
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
          canGoNext={filters.month !== thisMonth()}
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
        {count === 0 && !hasFilters && <EmptyState icon={Receipt} message={`No expenses in ${monthLabel}.`} />}
        {count > 0 && <ExpenseList expenses={expenses} />}
      </section>

      <Fab label="Add expense" onClick={() => setSheetOpen(true)} />

      <ExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
