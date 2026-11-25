import SegmentedControl from '../../components/SegmentedControl.jsx';
import { CURRENCIES, CURRENCY_CODES } from '../../constants/currencies.js';
import styles from './CurrencyPicker.module.css';

const NAMES = { USD: 'US dollar', KRW: 'Korean won', JPY: 'Japanese yen', CNY: 'Chinese yuan', KHR: 'Cambodian riel' };

// Symbol stacked over the code so all five fit on a phone.
const OPTIONS = CURRENCY_CODES.map((code) => ({
  value: code,
  ariaLabel: `${code}, ${NAMES[code]}`,
  label: (
    <span className={styles.option} aria-hidden="true">
      <span className={styles.symbol}>{CURRENCIES[code].symbol}</span>
      <span className={styles.code}>{code}</span>
    </span>
  ),
}));

export default function CurrencyPicker({ value, onChange }) {
  return (
    <SegmentedControl label="Currency" showLabel options={OPTIONS} value={value} onChange={onChange} fullWidth compact />
  );
}
