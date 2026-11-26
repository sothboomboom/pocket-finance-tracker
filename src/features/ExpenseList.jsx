import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { Skeleton } from '../components/Feedback.jsx';
import { formatDayLabel, groupByDay } from '../utils/dates.js';
import { formatMoney } from '../utils/money.js';
import { useCountUp } from '../hooks/useCountUp.js';
import { IconButton } from '../components/Button.jsx';
import { SegmentedControl, ExpenseRow } from '../components/UI.jsx';
import styles from './ExpenseList.module.css';

//////////////////////////////
// ExpenseList
//////////////////////////////

export function ExpenseList({ expenses }) {
  return (
    <div className={styles.list}>
      {groupByDay(expenses).map(({ date, items }) => (
        <section key={date} className={styles.group} aria-labelledby={`day-${date}`}>
          <h2 id={`day-${date}`} className={styles.day}>
            {formatDayLabel(date)}
          </h2>
          <ul className={styles.rows}>
            {items.map((expense) => (
              <li key={expense.id}>
                <ExpenseRow expense={expense} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

//////////////////////////////
// ExpenseListSkeleton
//////////////////////////////

// Grey shapes in the same layout as the list
export function ExpenseListSkeleton({ rows = 3 }) {
  return (
    <div className={styles.skeleton} aria-busy="true" aria-label="Loading expenses">
      <Skeleton className={styles.skeletonDay} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton className={styles.circle} />
          <div className={styles.lines}>
            <Skeleton className={styles.line} />
            <Skeleton className={styles.lineShort} />
          </div>
          <Skeleton className={styles.amount} />
        </div>
      ))}
    </div>
  );
}

//////////////////////////////
// HeroTotal
//////////////////////////////

const LABELS = { day: 'Spent today', week: 'Spent this week', month: 'Spent this month' };

export function HeroTotal({ period, total, count, rangeLabel, loading }) {
  const animatedTotal = useCountUp(total);
  return (
    <div className={styles.hero}>
      <p className="eyebrow">{LABELS[period]}</p>
      {loading ? (
        <Skeleton className={styles.amountSkeleton} />
      ) : (
        <p className={`${styles.heroTotalAmount} tabular-nums`}>
          {/* Screen readers hear the final number once, not every animation frame */}
          <span aria-hidden="true">{formatMoney(animatedTotal)}</span>
          <span className="visually-hidden">{formatMoney(total)}</span>
        </p>
      )}
      <p className="text-meta">
        {rangeLabel}
        {!loading && ` · ${count} ${count === 1 ? 'expense' : 'expenses'}`}
      </p>
    </div>
  );
}

//////////////////////////////
// MonthNavigator
//////////////////////////////

// Next is disabled on the current month: there are no future expenses.
export function MonthNavigator({ label, onPrevious, onNext, canGoNext }) {
  return (
    <div className={styles.navigator}>
      <IconButton icon={ChevronLeft} label="Previous month" onClick={onPrevious} />
      {/* aria-live: screen readers announce the new month */}
      <h2 className={styles.title} aria-live="polite">
        {label}
      </h2>
      <IconButton icon={ChevronRight} label="Next month" onClick={onNext} disabled={!canGoNext} />
    </div>
  );
}

//////////////////////////////
// ExpenseFilters
//////////////////////////////

const METHOD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
];

/** Stateless: the page keeps the values in the URL through useExpenseFilters. */
export function ExpenseFilters({ filters, categories, onSearchChange, onCategoryChange, onMethodChange }) {
  const searchId = useId();
  const categoryId = useId();

  return (
    <div className={styles.filters} role="search">
      <div className={styles.field}>
        <label htmlFor={searchId} className="field-label">
          Search
        </label>
        <div className={styles.control}>
          <Search className={styles.icon} strokeWidth={2} aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            className={`${styles.input} ${styles.withIcon}`}
            placeholder="Notes or categories"
            value={filters.q}
            onChange={(e) => onSearchChange(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={categoryId} className="field-label">
          Category
        </label>
        <div className={styles.control}>
          <select
            id={categoryId}
            className={`${styles.input} ${styles.select}`}
            value={filters.categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.chevron} strokeWidth={2} aria-hidden="true" />
        </div>
      </div>

      <div className={styles.field}>
        <SegmentedControl
          label="Paid with"
          showLabel
          options={METHOD_OPTIONS}
          value={filters.paymentMethod ?? 'all'}
          onChange={(value) => onMethodChange(value === 'all' ? null : value)}
          fullWidth
        />
      </div>
    </div>
  );
}
