import { forwardRef } from 'react';
import { FieldError } from '../../components/Feedback.jsx';
import { cleanAmountInput } from '../../utils/amountInput.js';
import styles from './AmountField.module.css';

// Pass the id of `children` (the USD preview) as `describedBy`, so screen readers read it with the field.
const AmountField = forwardRef(function AmountField(
  { id, value, onChange, symbol, decimals = 2, error, describedBy, children },
  ref,
) {
  const errorId = `${id}-error`;
  const describedByIds = [describedBy, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
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

export default AmountField;
