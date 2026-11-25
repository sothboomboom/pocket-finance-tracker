import { convertToUsd, formatMoney } from '../../utils/money.js';
import { BASE_CURRENCY } from '../../constants/currencies.js';
import styles from './UsdPreview.module.css';

/** Only a preview: the saved amount is converted when the expense is saved. Hidden for USD. */
export default function UsdPreview({ id, amount, currency, rate, ratesStatus }) {
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
