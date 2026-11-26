import { useMemo, useState } from 'react';
import { PageHeader } from '../components/Layout.jsx';
import { ErrorState, DashboardSkeleton } from '../components/Feedback.jsx';
import { PeriodNavigator, StatsRow, SpendingBarChart, CategoryDonut, TopCategories } from '../features/Dashboard.jsx';
import PeriodNavigator from '../features/dashboard/PeriodNavigator.jsx';
import StatsRow from '../features/dashboard/StatsRow.jsx';
import CategoryDonut from '../features/dashboard/CategoryDonut.jsx';
import SpendingBarChart from '../features/dashboard/SpendingBarChart.jsx';
import TopCategories from '../features/dashboard/TopCategories.jsx';
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
  const isCurrentPeriod = range.from <= today && today <= range.to;

  const { summary, status, error, reload, isRefreshing } = useSummary({ period, date });

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

      {status === 'loading' && <DashboardSkeleton />}
      {status === 'error' && <ErrorState message={error?.message} onRetry={reload} />}
      {status === 'success' && (
              <div className={`${styles.content} ${isRefreshing ? styles.refreshing : ''}`} aria-busy={isRefreshing}>
          <StatsRow summary={summary} period={summary.period} isCurrentPeriod={isCurrentPeriod} />
          <div className={styles.grid}>
            <div className={styles.bars}>
              <SpendingBarChart
                period={summary.period}
                series={summary.series}
                date={summary.range.from}
                total={summary.total}
              />
            </div>
            <div className={styles.donut}>
              <CategoryDonut byCategory={summary.byCategory} total={summary.total} />
            </div>
            <div className={styles.top}>
              <TopCategories byCategory={summary.byCategory} total={summary.total} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
