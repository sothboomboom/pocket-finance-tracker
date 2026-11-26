import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Sheet } from '../components/Sheet.jsx';
import { useCategories } from '../hooks/useData.js';
import { RATES_TO_USD } from '../store/rates.js';
import { SegmentedControl, CategoryIcon } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { FieldError } from '../components/Feedback.jsx';
import { CURRENCIES, BASE_CURRENCY, CURRENCY_CODES } from '../constants/currencies.js';
import { NOTE_MAX_LENGTH, PAYMENT_METHOD_OPTIONS } from '../constants/expenses.js';
import { todayISO } from '../utils/dates.js';
import { cleanAmountInput } from '../utils/amountInput.js';
import { convertToUsd, formatMoney } from '../utils/money.js';
import { getLastCurrency, setLastCurrency } from '../utils/storage.js';
import sheetStyles from '../components/Sheet.module.css';
import styles from './ExpenseForm.module.css';

// The add / edit expense sheet and its form.

const CURRENCY_NAMES = { USD: 'US dollar', KRW: 'Korean won', JPY: 'Japanese yen', CNY: 'Chinese yuan', KHR: 'Cambodian riel' };

// `session` changes every time the sheet opens. Using it as the form's key gives a fresh, empty form.
export function ExpenseSheet({ open, session, expense, onClose, ...formProps }) {
  const amountRef = useRef(null);
  return (
    <Sheet open={open} onClose={onClose} title={expense ? 'Edit expense' : 'Add expense'} initialFocusRef={amountRef}>
      <ExpenseForm key={session} expense={expense} amountRef={amountRef} {...formProps} />
    </Sheet>
  );
}

// Used by Home and All expenses to add a new expense. Editing happens on the expense's own page.
export function AddExpenseSheet({ open, session, onClose, onCreate }) {
  const { categories } = useCategories();
  return (
    <ExpenseSheet
      open={open}
      session={session}
      expense={null}
      onClose={onClose}
      categories={categories}
      onSubmit={onCreate}
    />
  );
}

function initialValues(expense) {
  if (!expense) {
    return {
      amount: '',
      currency: getLastCurrency(), // the currency used for the last saved expense
      categoryId: null,
      paymentMethod: 'cash',
      spentAt: todayISO(),
      note: '',
    };
  }
  return {
    amount: expense.amount.toFixed(CURRENCIES[expense.currency]?.decimals ?? 2), // 4.5 -> '4.50'
    currency: expense.currency,
    categoryId: expense.category.id,
    paymentMethod: expense.paymentMethod,
    spentAt: expense.spentAt,
    note: expense.note ?? '',
  };
}

// Quick checks while filling in the form. The store checks everything again when saving.
function validateValues(values) {
  const errors = {};
  if (!values.amount || Number(values.amount) <= 0) errors.amount = 'Enter an amount greater than 0';
  if (!values.categoryId) errors.categoryId = 'Choose a category';
  if (!values.spentAt) errors.spentAt = 'Choose a date';
  return errors;
}

function ExpenseForm({ expense, categories, onSubmit, onDelete, amountRef }) {
  const isEdit = Boolean(expense);
  const [values, setValues] = useState(() => initialValues(expense));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const formRef = useRef(null);

  const currency = CURRENCIES[values.currency];
  const showUsdPreview = values.currency !== BASE_CURRENCY;

  // When editing and the currency is unchanged, the saved rate is kept, so the preview uses it too.
  const previewRate =
    isEdit && values.currency === expense.currency ? expense.rateToUsd : RATES_TO_USD[values.currency];

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleCurrencyChange(code) {
    setValues((prev) => ({
      ...prev,
      currency: code,
      amount: cleanAmountInput(prev.amount, CURRENCIES[code].decimals), // '12.50' -> '12' for KRW
    }));
    setErrors((prev) => ({ ...prev, amount: undefined, currency: undefined }));
  }

  // Wait one frame so the error styles exist, then focus the first invalid field.
  function focusFirstError() {
    requestAnimationFrame(() => {
      formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateValues(values);
    setErrors(clientErrors);
    setFormError(null);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError();
      return;
    }

    try {
      onSubmit({ ...values, note: values.note.trim() || null });
      setLastCurrency(values.currency);
    } catch (err) {
      // The store can still reject something, e.g. "5." passes the check above but not the store's.
      if (err.fieldErrors) {
        setErrors(err.fieldErrors);
        focusFirstError();
      } else {
        setFormError(err.message);
      }
    }
  }

  const amountDescribedBy =
    [showUsdPreview ? 'expense-usd-preview' : null, errors.amount ? 'expense-amount-error' : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <form ref={formRef} className={sheetStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={sheetStyles.fields}>
        {/* Amount, with the currency symbol in front and a USD preview below */}
        <div className={styles.field}>
          <label htmlFor="expense-amount" className="field-label">
            Amount
          </label>
          <div className={`${styles.inputWrap} ${errors.amount ? styles.invalid : ''}`}>
            <span className={styles.symbol} aria-hidden="true">
              {currency.symbol}
            </span>
            <input
              ref={amountRef}
              id="expense-amount"
              type="text"
              inputMode={currency.decimals > 0 ? 'decimal' : 'numeric'}
              autoComplete="off"
              placeholder={currency.decimals > 0 ? `0.${'0'.repeat(currency.decimals)}` : '0'}
              className={`${styles.input} tabular-nums`}
              value={values.amount}
              onChange={(event) => setField('amount', cleanAmountInput(event.target.value, currency.decimals))}
              aria-invalid={errors.amount ? 'true' : undefined}
              aria-describedby={amountDescribedBy}
            />
          </div>
          {showUsdPreview && (
            <p id="expense-usd-preview" className={`${styles.preview} tabular-nums`}>
              ≈ {formatMoney(convertToUsd(values.amount || 0, previewRate))} USD
            </p>
          )}
          <FieldError id="expense-amount-error">{errors.amount}</FieldError>
        </div>

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

// Category chips. They're real radio buttons underneath, so arrow keys work.
function CategoryPicker({ categories, value, onChange, error }) {
  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? 'category-error' : undefined}>
      <legend className="field-legend">Category</legend>

      <div className={styles.grid}>
        {categories.map((category) => {
          const id = `category-${category.id}`;
          return (
            <span key={category.id} className={styles.categoryPickerOption}>
              <input
                type="radio"
                id={id}
                name="category"
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

      <FieldError id="category-error">{error}</FieldError>
    </fieldset>
  );
}
