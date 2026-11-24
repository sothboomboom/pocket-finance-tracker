import StatCard from './StatCard.jsx';
import PeriodComparison from './PeriodComparison.jsx';
import CashBankSplit from './CashBankSplit.jsx';
import { formatMoney } from '../../utils/money.js';
import styles from './StatsRow.module.css';

export default function StatsRow({ summary, period, isCurrentPeriod }) {
  const { total, count, averagePerDay, previousTotal, paymentSplit } = summary;

  // In the Daily view "average per day" would equal the total, so show the average expense.
  const average =
    period === 'day'
      ? { label: 'Average per expense', value: count > 0 ? formatMoney(total / count) : '—' }
      : { label: 'Average per day', value: averagePerDay === null ? '—' : formatMoney(averagePerDay) };

  return (
    <section className={styles.row} aria-label="Summary">
      <StatCard label="Total spent" value={formatMoney(total)}>
        <PeriodComparison
          total={total}
          previousTotal={previousTotal}
          period={period}
          isCurrentPeriod={isCurrentPeriod}
        />
      </StatCard>
      <StatCard label={average.label} value={average.value} />
      <StatCard label="Expenses" value={count} />
      <StatCard label="Cash vs bank" value={total > 0 ? `${Math.round((paymentSplit.cash / total) * 100)}% cash` : '—'}>
        <CashBankSplit cash={paymentSplit.cash} bank={paymentSplit.bank} />
      </StatCard>
    </section>
  );
}
