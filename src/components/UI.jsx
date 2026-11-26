import { Link } from 'react-router-dom';
import { CATEGORY_ICONS, FALLBACK_CATEGORY_ICON } from '../constants/categories.js';
import { formatMoney } from '../utils/money.js';
import { BASE_CURRENCY } from '../constants/currencies.js';
import styles from './UI.module.css';

// Small building blocks used on many pages.

//////////////////////////////
// Card
//////////////////////////////

// Flat on purpose: shadows are kept for things that float (sheets, toasts).
export function Card({ title, subtitle, action, className = '', children }) {
  return (
    <section className={`${styles.card} ${className}`} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.titles}>
          <h2 className={styles.title}>
            {title}
          </h2>
          {subtitle && <div className="text-meta">{subtitle}</div>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

//////////////////////////////
// Tag
//////////////////////////////

export function Tag({ children }) {
  return <span className={styles.tag}>{children}</span>;
}

//////////////////////////////
// SegmentedControl
//////////////////////////////

/**
 * Built on native radio inputs, so arrow keys and screen readers work for free.
 * showLabel: show the legend (in forms); otherwise it's for screen readers only.
 */
export function SegmentedControl({
  label,
  showLabel = false,
  options,
  value,
  onChange,
  name,
  fullWidth = false,
  compact = false,
}) {
  const groupName = name ?? label.toLowerCase().replace(/ /g, '-'); // e.g. "paid-with"

  return (
    <fieldset className={`${styles.control} ${fullWidth ? styles.fullWidth : ''} ${compact ? styles.compact : ''}`}>
      <legend className={showLabel ? 'field-legend' : 'visually-hidden'}>{label}</legend>
      <div className={styles.track} style={{ '--count': options.length }}>
        {options.map((option) => {
          const id = `${groupName}-${option.value}`;
          return (
            <span key={option.value} className={styles.option}>
              <input
                type="radio"
                id={id}
                name={groupName}
                value={option.value}
                aria-label={option.ariaLabel}
                checked={option.value === value}
                onChange={() => onChange(option.value)}
                className={styles.input}
              />
              <label htmlFor={id} className={styles.label}>
                {option.label}
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}

//////////////////////////////
// CategoryIcon
//////////////////////////////

/** Grey circle with the category's icon. size: 'sm' (40px) | 'md' (48px). */
export function CategoryIcon({ icon, size = 'sm' }) {
  const Icon = CATEGORY_ICONS[icon] ?? FALLBACK_CATEGORY_ICON;
  return (
    <span className={`${styles.circle} ${styles[size]}`} aria-hidden="true">
      <Icon strokeWidth={2} />
    </span>
  );
}

//////////////////////////////
// ExpenseRow
//////////////////////////////

// A link, not a button: it navigates, so open-in-new-tab works.
export function ExpenseRow({ expense }) {
  const { id, note, category, paymentMethod, amountUsd, amount, currency } = expense;
  const isForeign = currency !== BASE_CURRENCY;

  return (
    <Link to={`/expenses/${id}`} className={styles.row}>
      <CategoryIcon icon={category.icon} />

      <span className={styles.main}>
        <span className={styles.expenseRowTitle}>{note || category.name}</span>
        <span className={styles.meta}>
          <Tag>{paymentMethod === 'cash' ? 'Cash' : 'Bank'}</Tag>
          {/* The note takes the title, so the category name moves here */}
          {note && <span className={styles.secondary}>{category.name}</span>}
        </span>
      </span>

      <span className={styles.amounts}>
        <span className={`${styles.amount} tabular-nums`}>{formatMoney(amountUsd)}</span>
        {isForeign && (
          <span className={`${styles.secondary} tabular-nums`}>
            ≈ {formatMoney(amountUsd)} · {formatMoney(amount, currency)}
          </span>
        )}
      </span>
    </Link>
  );
}
