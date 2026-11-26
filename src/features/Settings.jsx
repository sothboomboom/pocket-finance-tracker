import { RotateCcw } from 'lucide-react';
import { Card } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmSheet } from '../components/Sheet.jsx';
import { CURRENCIES } from '../constants/currencies.js';
import { RATES_TO_USD } from '../store/rates.js';
import { useAppData } from '../context/DataContext.js';
import { useToast } from '../context/ToastContext.js';
import { useSheet } from '../hooks/useSheet.js';
import { formatMoney } from '../utils/money.js';
import styles from './Settings.module.css';

// The cards on the Settings page

//////////////////////////////
// RatesCard
//////////////////////////////

const ROWS = [
  { code: 'KRW', name: 'Korean won' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'KHR', name: 'Cambodian riel' },
];

export function RatesCard() {
  return (
    <Card title="Exchange rates" subtitle="Fixed rates used to convert every expense to US dollars.">
      <ul className={styles.list}>
        {ROWS.map(({ code, name }) => (
          <li key={code} className={styles.row}>
            <span className={styles.symbol} aria-hidden="true">
              {CURRENCIES[code].symbol}
            </span>
            <span className={styles.currency}>
              <span className="text-strong">{code}</span>
              <span className="text-meta">{name}</span>
            </span>
            <span className="text-strong tabular-nums">
              $1 = {formatMoney(1 / RATES_TO_USD[code], code)}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

//////////////////////////////
// SampleDataCard
//////////////////////////////

// Reset everything to the sample data
export function SampleDataCard() {
  const { resetSampleData } = useAppData();
  const sheet = useSheet();
  const { showToast } = useToast();

  function handleReset() {
    resetSampleData();
    sheet.closeSheet();
    showToast({ message: 'Sample data restored' });
  }

  return (
    <Card title="Your data">
      <p className="text-body">
        Expenses and categories are saved in this browser, so they're still here after you close it. Resetting
        replaces everything with the sample data.
      </p>
      <div>
        <Button variant="danger" icon={RotateCcw} onClick={sheet.openSheet}>
          Reset sample data
        </Button>
      </div>

      <ConfirmSheet
        open={sheet.open}
        session={sheet.session}
        title="Reset to sample data?"
        onClose={sheet.closeSheet}
        onConfirm={handleReset}
        confirmLabel="Reset data"
        confirmIcon={RotateCcw}
      >
        <p>All your expenses and categories will be replaced with the sample data. This can't be undone.</p>
      </ConfirmSheet>
    </Card>
  );
}
