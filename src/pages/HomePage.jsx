import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { PageHeader, Fab } from '../components/Layout.jsx';
import { SegmentedControl } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState, ErrorState } from '../components/Feedback.jsx';
import { ExpenseList, ExpenseListSkeleton, HeroTotal } from '../features/ExpenseList.jsx';
import AddExpenseSheet from '../features/expenses/AddExpenseSheet.jsx';
import { useExpenses } from '../hooks/useData.js';
import { useSheet } from '../hooks/useSheet.js';
import { useToast } from '../context/ToastContext.js';
import { PERIOD_OPTIONS } from '../constants/expenses.js';
import { getPeriodRange, formatRangeLabel } from '../utils/dates.js';
import { sumUsd } from '../utils/money.js';
import styles from './HomePage.module.css';

const EMPTY_MESSAGES = {
  day: 'No expenses today yet.',
  week: 'No expenses this week yet.',
  month: 'No expenses this month yet.',
};

export default function HomePage() {
  const [period, setPeriod] = useState('week');
  const range = useMemo(() => getPeriodRange(period), [period]);
  const { expenses, status, error, reload, isRefreshing, createExpense } = useExpenses(range);
  const sheet = useSheet();
  const { showToast } = useToast();

  async function handleCreate(values) {
    await createExpense(values);
    showToast({ message: 'Expense added' });
    sheet.closeSheet();
  }

  const addButton = (
    <Button icon={Plus} onClick={sheet.openSheet}>
      Add expense
    </Button>
  );
  // When empty, the empty state's button is the main action, so the header one turns secondary.
  const isEmpty = status === 'success' && expenses.length === 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Home"
        actions={
          <div className={styles.headerAction}>
            <Button variant={isEmpty ? 'secondary' : 'primary'} icon={Plus} onClick={sheet.openSheet}>
              Add expense
            </Button>
          </div>
        }
      />

      <section aria-label="Total spent">
        <div className={styles.periodControl}>
          <SegmentedControl label="Period" options={PERIOD_OPTIONS} value={period} onChange={setPeriod} fullWidth />
        </div>
        <HeroTotal
          period={period}
          total={sumUsd(expenses)}
          count={expenses.length}
          rangeLabel={formatRangeLabel(period, range)}
          loading={status === 'loading'}
        />
      </section>

      <section
        aria-label="Expenses"
        aria-busy={isRefreshing}
        className={`${styles.listSection} ${isRefreshing ? styles.refreshing : ''}`}
      >
        {status === 'loading' && <ExpenseListSkeleton />}
        {status === 'error' && <ErrorState message={error?.message} onRetry={reload} />}
        {status === 'success' && expenses.length === 0 && (
          <EmptyState icon={Receipt} message={EMPTY_MESSAGES[period]} action={addButton} />
        )}
        {status === 'success' && expenses.length > 0 && <ExpenseList expenses={expenses} />}
        {status === 'success' && (
          <p className={styles.historyLink}>
            <Link to="/expenses">See all expenses</Link>
          </p>
        )}
      </section>

      <Fab label="Add expense" onClick={sheet.openSheet} />

      <AddExpenseSheet
        open={sheet.open}
        session={sheet.session}
        onClose={sheet.closeSheet}
        onCreate={handleCreate}
      />
    </div>
  );
}
