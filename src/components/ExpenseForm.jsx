import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from './Sheet.jsx';
import { SegmentedControl, CategoryIcon } from './UI.jsx';
import { Button } from './Button.jsx';
import { FieldError } from './Feedback.jsx';
import { useFinance } from '../context/useFinance.js';
import { CURRENCIES, BASE_CURRENCY, CURRENCY_CODES, RATES_TO_USD } from '../data/currencies.js';
import { NOTE_MAX_LENGTH } from '../data/categories.js';
import { todayISO } from '../utils/dates.js';
import { convertToUsd, formatMoney } from '../utils/money.js';
import sheetStyles from './Sheet.module.css';
import styles from './ExpenseForm.module.css';

// The add / edit expense sheet and every field in its form.

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
];

const CURRENCY_NAMES = { USD: 'US dollar', KRW: 'Korean won', JPY: 'Japanese yen', CNY: 'Chinese yuan', KHR: 'Cambodian riel' };

/** Pass an `expense` to edit it; leave it out to add a new one. */
export function ExpenseSheet({ open, expense = null, onClose, onSubmit, onDelete }) {
  const amountRef = useRef(null);
  return (
    <Sheet open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'} initialFocusRef={amountRef}>
      <ExpenseForm expense={expense} amountRef={amountRef} onSubmit={onSubmit} onDelete={onDelete} />
    </Sheet>
  );
}

// ExpenseForm
function initialValues(expense, lastCurrency) {
  if (!expense) {
    return {
      amount: '',
      currency: lastCurrency,
      categoryId: null,
      paymentMethod: 'cash',
      spentAt: todayISO(),
      note: '',
    };
  }
  return {
    // 4.5 -> '4.50'
    amount: expense.amount.toFixed(CURRENCIES[expense.currency]?.decimals ?? 2),
    currency: expense.currency,
    categoryId: expense.category.id,
    paymentMethod: expense.paymentMethod,
    spentAt: expense.spentAt,
    note: expense.note ?? '',
  };
}

/** If saving fails with field errors, each one shows under its field. */
function ExpenseForm({ expense, onSubmit, onDelete, amountRef }) {
  const isEdit = Boolean(expense);
  const { categories, lastCurrency, setLastCurrency } = useFinance();
  const [values, setValues] = useState(() => initialValues(expense, lastCurrency));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const formRef = useRef(null);

  const currency = CURRENCIES[values.currency];

  // Same rule as saving: an unchanged currency keeps its saved rate, so the preview matches.
  const previewRate =
    isEdit && values.currency === expense.currency ? expense.rateToUsd : RATES_TO_USD[values.currency];

  function handleCurrencyChange(code) {
    setValues((prev) => ({
      ...prev,
      currency: code,
      // '12.50' becomes '12' for a currency without decimals
      amount: cleanAmountInput(prev.amount, CURRENCIES[code].decimals),
    }));
    setErrors((prev) => ({ ...prev, amount: undefined, currency: undefined }));
  }

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    try {
      onSubmit({
        amount: values.amount,
        currency: values.currency,
        categoryId: values.categoryId,
        paymentMethod: values.paymentMethod,
        spentAt: values.spentAt,
        note: values.note.trim() || null,
      });
      setLastCurrency(values.currency);
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      // Errors without a field show above the buttons
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      else focusFirstError();
    }
  }

  return (
    <form ref={formRef} className={sheetStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={sheetStyles.fields}>
        <AmountField
          ref={amountRef}
          id="expense-amount"
          value={values.amount}
          onChange={(value) => setField('amount', value)}
          symbol={currency.symbol}
          decimals={currency.decimals}
          error={errors.amount}
          describedBy="expense-usd-preview"
        >
          <UsdPreview
            id="expense-usd-preview"
            amount={values.amount}
            currency={values.currency}
            rate={previewRate}
          />
        </AmountField>

        <div className={sheetStyles.field}>
          <label htmlFor="expense-currency" className="field-label">
            Currency
          </label>
          <select
            id="expense-currency"
            className={sheetStyles.input}
            value={values.currency}
            onChange={(event) => handleCurrencyChange(event.target.value)}
            aria-invalid={errors.currency ? 'true' : undefined}
            aria-describedby={errors.currency ? 'expense-currency-error' : undefined}
          >
            {CURRENCY_CODES.map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].symbol} {code} – {CURRENCY_NAMES[code]}
              </option>
            ))}
          </select>
          <FieldError id="expense-currency-error">{errors.currency}</FieldError>
        </div>

        <CategoryPicker
          categories={categories}
          value={values.categoryId}
          onChange={(id) => setField('categoryId', id)}
          error={errors.categoryId}
        />

        <div className={sheetStyles.field}>
          <SegmentedControl
            label="Payment method"
            showLabel
            options={PAYMENT_METHOD_OPTIONS}
            value={values.paymentMethod}
            onChange={(value) => setField('paymentMethod', value)}
            fullWidth
          />
          <FieldError id="expense-payment-error">{errors.paymentMethod}</FieldError>
        </div>

        <div className={sheetStyles.field}>
          <label htmlFor="expense-date" className="field-label">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            className={sheetStyles.input}
            value={values.spentAt}
            onChange={(event) => setField('spentAt', event.target.value)}
            aria-invalid={errors.spentAt ? 'true' : undefined}
            aria-describedby={errors.spentAt ? 'expense-date-error' : undefined}
          />
          <FieldError id="expense-date-error">{errors.spentAt}</FieldError>
        </div>

        <div className={sheetStyles.field}>
          <label htmlFor="expense-note" className="field-label">
            Note <span className="text-muted">(optional)</span>
          </label>
          <input
            id="expense-note"
            type="text"
            className={sheetStyles.input}
            value={values.note}
            maxLength={NOTE_MAX_LENGTH}
            onChange={(event) => setField('note', event.target.value)}
            placeholder="e.g. Lunch with Dara"
            aria-invalid={errors.note ? 'true' : undefined}
            aria-describedby={`expense-note-count${errors.note ? ' expense-note-error' : ''}`}
          />
          <p id="expense-note-count" className={`${sheetStyles.hint} tabular-nums`}>
            {values.note.length}/{NOTE_MAX_LENGTH}
          </p>
          <FieldError id="expense-note-error">{errors.note}</FieldError>
        </div>
      </div>

      <div className={sheetStyles.footer}>
        {formError && (
          <div role="alert">
            <FieldError id="expense-form-error">{formError}</FieldError>
          </div>
        )}
        <div className={sheetStyles.actions}>
          {isEdit && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(expense)}>
              Delete
            </Button>
          )}
          <Button type="submit" className={sheetStyles.save}>
            {isEdit ? 'Save changes' : 'Save expense'}
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Keeps only digits and one decimal point, with at most `decimals` decimals. */
function cleanAmountInput(raw, decimals = 2) {
  let text = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const [whole, ...rest] = text.split('.');
  const fraction = rest.join('');
  if (decimals === 0) return whole.slice(0, 12);
  text = rest.length > 0 ? `${whole.slice(0, 12)}.${fraction.slice(0, decimals)}` : whole.slice(0, 12);
  return text;
}

// Pass the id of `children` (the USD preview) as `describedBy`, so screen readers read it with the field.
function AmountField({ id, value, onChange, symbol, decimals = 2, error, describedBy, children, ref }) {
  const errorId = `${id}-error`;
  const describedByIds = [describedBy, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className="field-label">
        Amount
      </label>
      <div className={`${styles.inputWrap} ${error ? styles.invalid : ''}`}>
        <span className={styles.symbol} aria-hidden="true">
          {symbol}
        </span>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          autoComplete="off"
          placeholder={decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0'}
          className={`${styles.input} tabular-nums`}
          value={value}
          onChange={(event) => onChange(cleanAmountInput(event.target.value, decimals))}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedByIds}
        />
      </div>
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

/** Only a preview: the saved amount is converted when the expense is saved. Hidden for USD. */
function UsdPreview({ id, amount, currency, rate }) {
  if (currency === BASE_CURRENCY) return null;
  return (
    <p id={id} className={`${styles.preview} tabular-nums`}>
      ≈ {formatMoney(convertToUsd(amount || 0, rate))} USD
    </p>
  );
}

// Native radio inputs, so arrow keys work.
function CategoryPicker({ categories, value, onChange, error, ref: firstInputRef }) {
  const name = 'category';
  const errorId = `${name}-error`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className="field-legend">Category</legend>

      <div className={styles.grid}>
        {categories.map((category, index) => {
          const id = `${name}-${category.id}`;
          return (
            <span key={category.id} className={styles.categoryPickerOption}>
              <input
                ref={index === 0 ? firstInputRef : undefined}
                type="radio"
                id={id}
                name={name}
                value={category.id}
                checked={value === category.id}
                onChange={() => onChange(category.id)}
                className={styles.categoryPickerInput}
                aria-invalid={error ? 'true' : undefined}
              />
              <label htmlFor={id} className={styles.chip}>
                <CategoryIcon icon={category.icon} />
                <span className={styles.name}>{category.name}</span>
              </label>
            </span>
          );
        })}
      </div>

      <FieldError id={errorId}>{error}</FieldError>
    </fieldset>
  );
}
