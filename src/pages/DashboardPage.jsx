import { useMemo, useState } from 'react';
import { PageHeader } from '../components/Layout.jsx';
import { PeriodNavigator, StatsRow, SpendingBarChart, TopCategories } from '../features/Dashboard.jsx';
import { useSummary } from '../hooks/useSummary.js';
import { getPeriodRange, formatRangeLabel, shiftPeriod, todayISO } from '../utils/dates.js';
import { parseISO } from 'date-fns';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const [period, setPeriod] = useState('week');
  // Any day inside the shown period; the arrows move it by one period.
  const [date, setDate] = useState(todayISO);

  const range = useMemo(() => getPeriodRange(period, parseISO(date)), [period, date]);
  const today = todayISO();

  const summary = useSummary({ period, date });

  return (
    <>
      <PageHeader title="Dashboard" />

      <PeriodNavigator
        period={period}
        onPeriodChange={setPeriod}
        rangeLabel={formatRangeLabel(period, range)}
        onPrevious={() => setDate((d) => shiftPeriod(period, d, -1))}
        onNext={() => setDate((d) => shiftPeriod(period, d, 1))}
        canGoNext={range.to < today}
      />

      <div className={styles.content}>
        <StatsRow summary={summary} />
        <div className={styles.grid}>
          <SpendingBarChart period={summary.period} series={summary.series} total={summary.total} />
          <TopCategories byCategory={summary.byCategory} total={summary.total} />
        </div>
      </div>
    </>
  );
}
