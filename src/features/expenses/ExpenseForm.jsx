import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import AmountField from './AmountField.jsx';
import CategoryPicker from './CategoryPicker.jsx';
import CurrencyPicker from './CurrencyPicker.jsx';
import UsdPreview from './UsdPreview.jsx';
import { SegmentedControl } from '../../components/UI.jsx';
import { FieldError } from '../../components/Feedback.jsx';
import { Button } from '../../components/Button.jsx';
import { CURRENCIES } from '../../constants/currencies.js';
import { NOTE_MAX_LENGTH, PAYMENT_METHOD_OPTIONS } from '../../constants/expenses.js';
import { todayISO } from '../../utils/dates.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { cleanAmountInput } from '../../utils/amountInput.js';
import styles from '../../components/Sheet.module.css';

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
export default function ExpenseForm({
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
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fields}>
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

        <div className={styles.field}>
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

        <div className={styles.field}>
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

        <div className={styles.field}>
          <label htmlFor="expense-date" className={styles.label}>
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            className={styles.input}
            value={values.spentAt}
            onChange={(event) => setField('spentAt', event.target.value)}
            aria-invalid={errors.spentAt ? 'true' : undefined}
            aria-describedby={errors.spentAt ? 'expense-date-error' : undefined}
          />
          <FieldError id="expense-date-error">{errors.spentAt}</FieldError>
        </div>

        <div className={styles.field}>
          <label htmlFor="expense-note" className={styles.label}>
            Note <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="expense-note"
            type="text"
            className={styles.input}
            value={values.note}
            maxLength={NOTE_MAX_LENGTH}
            onChange={(event) => setField('note', event.target.value)}
            placeholder="e.g. Lunch with Dara"
            aria-invalid={errors.note ? 'true' : undefined}
            aria-describedby={`expense-note-count${errors.note ? ' expense-note-error' : ''}`}
          />
          <p id="expense-note-count" className={`${styles.hint} tabular-nums`}>
            {values.note.length}/{NOTE_MAX_LENGTH}
          </p>
          <FieldError id="expense-note-error">{errors.note}</FieldError>
        </div>
      </div>

      <div className={styles.footer}>
        {formError && (
          <div className={styles.formError} role="alert">
            <FieldError id="expense-form-error">{formError}</FieldError>
          </div>
        )}
        <div className={styles.actions}>
          {isEdit && (
            <Button variant="danger" icon={Trash2} onClick={() => onDelete(expense)} disabled={saving}>
              Delete
            </Button>
          )}
          <Button type="submit" className={styles.save} loading={saving} loadingText="Saving…">
            {isEdit ? 'Save changes' : 'Save expense'}
          </Button>
        </div>
      </div>
    </form>
  );
}
