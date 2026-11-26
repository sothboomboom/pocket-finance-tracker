import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { formatDayLabel, groupByDay } from '../utils/dates.js';
import { formatMoney } from '../utils/money.js';
import { IconButton } from '../components/Button.jsx';
import { SegmentedControl, ExpenseRow } from '../components/UI.jsx';
import styles from './ExpenseList.module.css';

// Lists of expenses: the day-grouped list, the big total, and the month / filter controls of All expenses.

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
// HeroTotal
//////////////////////////////

const LABELS = { day: 'Spent today', week: 'Spent this week', month: 'Spent this month' };

export function HeroTotal({ period, total, count, rangeLabel }) {
  return (
    <div className={styles.hero}>
      <p className="eyebrow">{LABELS[period]}</p>
      <p className={`${styles.heroTotalAmount} tabular-nums`}>{formatMoney(total)}</p>
      <p className="text-meta">
        {rangeLabel} · {count} {count === 1 ? 'expense' : 'expenses'}
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
export function ExpenseFilters({ filters, categories, onCategoryChange, onMethodChange }) {
  const categoryId = 'filter-category';

  return (
    <div className={styles.filters} role="search">
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
