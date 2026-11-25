import { useId } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import styles from './ExpenseFilters.module.css';

const METHOD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
];

/** Stateless: the page keeps the values in the URL through useExpenseFilters. */
export default function ExpenseFilters({ filters, categories, onSearchChange, onCategoryChange, onMethodChange }) {
  const searchId = useId();
  const categoryId = useId();

  return (
    <div className={styles.filters} role="search">
      <div className={styles.field}>
        <label htmlFor={searchId} className={styles.label}>
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
        <label htmlFor={categoryId} className={styles.label}>
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
