import { RotateCcw, Trash2 } from 'lucide-react';
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

// The cards on the Settings page.

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

// Load the sample data, or delete everything and start empty
export function SampleDataCard() {
  const { resetSampleData, clearAllData } = useAppData();
  const sampleSheet = useSheet();
  const deleteSheet = useSheet();
  const { showToast } = useToast();

  function handleLoadSample() {
    resetSampleData();
    sampleSheet.closeSheet();
    showToast({ message: 'Sample data loaded' });
  }

  function handleDeleteAll() {
    clearAllData();
    deleteSheet.closeSheet();
    showToast({ message: 'All data deleted' });
  }

  return (
    <Card title="Your data">
      <p className="text-body">
        Expenses and categories are saved in this browser, so they're still here after you close it. Want to try the
        app first? Load the sample data: about two months of made-up expenses.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" icon={RotateCcw} onClick={sampleSheet.openSheet}>
          Load sample data
        </Button>
        <Button variant="danger" icon={Trash2} onClick={deleteSheet.openSheet}>
          Delete all data
        </Button>
      </div>

      <ConfirmSheet
        open={sampleSheet.open}
        session={sampleSheet.session}
        title="Load the sample data?"
        onClose={sampleSheet.closeSheet}
        onConfirm={handleLoadSample}
        confirmLabel="Load sample data"
        confirmIcon={RotateCcw}
      >
        <p>All your expenses and categories will be replaced with the sample data. This can't be undone.</p>
      </ConfirmSheet>

      <ConfirmSheet
        open={deleteSheet.open}
        session={deleteSheet.session}
        title="Delete all data?"
        onClose={deleteSheet.closeSheet}
        onConfirm={handleDeleteAll}
        confirmLabel="Delete all data"
        confirmIcon={Trash2}
      >
        <p>All your expenses will be deleted and the categories go back to the default ones. This can't be undone.</p>
      </ConfirmSheet>
    </Card>
  );
}
