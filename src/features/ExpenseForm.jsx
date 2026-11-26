import { useEffect, useRef, useState, forwardRef, useId } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '../components/Sheet.jsx';
import { useCategories, useRates } from '../hooks/useData.js';
import { SegmentedControl, CategoryIcon } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { CURRENCIES, BASE_CURRENCY, CURRENCY_CODES } from '../constants/currencies.js';
import { NOTE_MAX_LENGTH, PAYMENT_METHOD_OPTIONS } from '../constants/expenses.js';
import { todayISO } from '../utils/dates.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { cleanAmountInput } from '../utils/amountInput.js';
import sheetStyles from '../components/Sheet.module.css';
import { convertToUsd, formatMoney } from '../utils/money.js';
import { Skeleton, FieldError } from '../components/Feedback.jsx';
import styles from './ExpenseForm.module.css';

// The add / edit expense sheet and every field in its form.

//////////////////////////////
// ExpenseSheet
//////////////////////////////

/** `session` changes on every open, which remounts the form so it starts fresh. */
export function ExpenseSheet({ open, session, expense, onClose, ...formProps }) {
  const amountRef = useRef(null);
  const { rates, status: ratesStatus, reload: reloadRates } = useRates();

  // Refresh rates on every open; cached rates stay on screen meanwhile.
  useEffect(() => {
    if (session > 1) reloadRates();
  }, [session, reloadRates]);

  return (
    <Sheet open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'} initialFocusRef={amountRef}>
      <ExpenseForm
        key={session}
        expense={expense}
        amountRef={amountRef}
        rates={rates}
        ratesStatus={ratesStatus}
        {...formProps}
      />
    </Sheet>
  );
}

//////////////////////////////
// AddExpenseSheet
//////////////////////////////

// The same sheet with no expense, plus the shared categories
/** Used by Home and All expenses. Editing happens on the expense's own page. */
export function AddExpenseSheet({ open, session, onClose, onCreate }) {
  const { categories, status, reload } = useCategories();
  return (
    <ExpenseSheet
      open={open}
      session={session}
      expense={null}
      onClose={onClose}
      categories={categories}
      categoriesStatus={status}
      onRetryCategories={reload}
      onSubmit={onCreate}
    />
  );
}

//////////////////////////////
// ExpenseForm
//////////////////////////////

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

// Instant feedback only; mock/validation.js checks again on save.
function validateValues(values) {
  const errors = {};
  if (!values.amount || Number(values.amount) <= 0) errors.amount = 'Enter an amount greater than 0';
  if (!values.categoryId) errors.categoryId = 'Choose a category';
  if (!values.spentAt) errors.spentAt = 'Choose a date';
  return errors;
}

/** If onSubmit rejects with an ApiError, its field errors show under the matching fields. */
function ExpenseForm({
  expense,
  categories,
  categoriesStatus,
  onRetryCategories,
  onSubmit,
  onDelete,
  amountRef,
  rates,
  ratesStatus,
}) {
  const isEdit = Boolean(expense);
  const { lastCurrency, setLastCurrency } = usePreferences();
  const [values, setValues] = useState(() => initialValues(expense, lastCurrency));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const currency = CURRENCIES[values.currency];

  // Same rule as saving: an unchanged currency keeps its saved rate, so the preview matches.
  const previewRate =
    isEdit && values.currency === expense.currency ? expense.rateToUsd : (rates?.[values.currency] ?? null);

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

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const clientErrors = validateValues(values);
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError();
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
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
      setSaving(false);
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
            ratesStatus={ratesStatus}
          />
        </AmountField>

        <div className={sheetStyles.field}>
          <CurrencyPicker value={values.currency} onChange={handleCurrencyChange} />
          <FieldError id="expense-currency-error">{errors.currency}</FieldError>
        </div>

        <CategoryPicker
          categories={categories}
          status={categoriesStatus}
          onRetry={onRetryCategories}
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
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(expense)} disabled={saving}>
              Delete
            </Button>
          )}
          <Button type="submit" className={sheetStyles.save} loading={saving} loadingText="Saving…">
            {isEdit ? 'Save changes' : 'Save expense'}
          </Button>
        </div>
      </div>
    </form>
  );
}

//////////////////////////////
// AmountField
//////////////////////////////

// Pass the id of `children` (the USD preview) as `describedBy`, so screen readers read it with the field.
const AmountField = forwardRef(function AmountField(
  { id, value, onChange, symbol, decimals = 2, error, describedBy, children },
  ref,
) {
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
});

//////////////////////////////
// UsdPreview
//////////////////////////////

/** Only a preview: the saved amount is converted when the expense is saved. Hidden for USD. */
function UsdPreview({ id, amount, currency, rate, ratesStatus }) {
  if (currency === BASE_CURRENCY) return null;

  let text;
  if (rate) {
    text = `≈ ${formatMoney(convertToUsd(amount || 0, rate))} USD`;
  } else if (ratesStatus === 'loading') {
    text = 'Loading exchange rate…';
  } else {
    text = "Couldn't load rates. We'll convert to USD when you save.";
  }

  return (
    <p id={id} className={`${styles.preview} tabular-nums`}>
      {text}
    </p>
  );
}

//////////////////////////////
// CurrencyPicker
//////////////////////////////

const NAMES = { USD: 'US dollar', KRW: 'Korean won', JPY: 'Japanese yen', CNY: 'Chinese yuan', KHR: 'Cambodian riel' };

// Symbol stacked over the code so all five fit on a phone.
const OPTIONS = CURRENCY_CODES.map((code) => ({
  value: code,
  ariaLabel: `${code}, ${NAMES[code]}`,
  label: (
    <span className={styles.option} aria-hidden="true">
      <span className={styles.currencyPickerSymbol}>{CURRENCIES[code].symbol}</span>
      <span className={styles.code}>{code}</span>
    </span>
  ),
}));

function CurrencyPicker({ value, onChange }) {
  return (
    <SegmentedControl label="Currency" showLabel options={OPTIONS} value={value} onChange={onChange} fullWidth compact />
  );
}

//////////////////////////////
// CategoryPicker
//////////////////////////////

// Native radio inputs, so arrow keys work.
const CategoryPicker = forwardRef(function CategoryPicker(
  { categories, status, onRetry, value, onChange, error },
  firstInputRef,
) {
  const name = useId();
  const errorId = `${name}-error`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className="field-legend">Category</legend>

      {status === 'loading' && (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className={styles.chipSkeleton} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className={styles.loadError}>
          <FieldError id={errorId}>Couldn't load categories.</FieldError>
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}

      {status === 'success' && (
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
                  <CategoryIcon icon={category.icon} color={category.color} />
                  <span className={styles.name}>{category.name}</span>
                </label>
              </span>
            );
          })}
        </div>
      )}

      {status !== 'error' && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
});
