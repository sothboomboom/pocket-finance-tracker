import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Receipt } from 'lucide-react';
import { PageHeader, Fab } from '../components/Layout.jsx';
import { SegmentedControl } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/Feedback.jsx';
import { ExpenseList, HeroTotal } from '../components/ExpenseList.jsx';
import { ExpenseSheet } from '../components/ExpenseForm.jsx';
import { useFinance } from '../context/useFinance.js';
import { getPeriodRange, formatRangeLabel } from '../utils/dates.js';
import { sumUsd } from '../utils/money.js';
import styles from './HomePage.module.css';

const PERIOD_OPTIONS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const EMPTY_MESSAGES = {
  day: 'No expenses today yet.',
  week: 'No expenses this week yet.',
  month: 'No expenses this month yet.',
};

export default function HomePage() {
  const { listExpenses, createExpense } = useFinance();
  const [period, setPeriod] = useState('week');
  const [sheetOpen, setSheetOpen] = useState(false);

  const range = getPeriodRange(period);
  const expenses = listExpenses(range);

  function handleCreate(values) {
    createExpense(values);
    setSheetOpen(false);
  }

  const openSheet = () => setSheetOpen(true);
  // When empty, the empty state's button is the main action, so the header one turns secondary.
  const isEmpty = expenses.length === 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Home"
        actions={
          <div className={styles.headerAction}>
            <Button variant={isEmpty ? 'secondary' : 'primary'} icon={Plus} onClick={openSheet}>
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
        />
      </section>

      <section aria-label="Expenses" className={styles.listSection}>
        {isEmpty ? (
          <EmptyState
            icon={Receipt}
            message={EMPTY_MESSAGES[period]}
            action={
              <Button icon={Plus} onClick={openSheet}>
                Add expense
              </Button>
            }
          />
        ) : (
          <ExpenseList expenses={expenses} />
        )}
        <p className={styles.historyLink}>
          <Link to="/expenses">See all expenses</Link>
        </p>
      </section>

      <Fab label="Add expense" onClick={openSheet} />

      <ExpenseSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={handleCreate} />
    </div>
  );
}
