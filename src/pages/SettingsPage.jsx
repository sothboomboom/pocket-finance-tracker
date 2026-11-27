import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/Layout.jsx';
import { Card } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmSheet } from '../components/Sheet.jsx';
import { useFinance } from '../context/useFinance.js';
import { CURRENCIES, RATES_TO_USD } from '../data/currencies.js';
import { formatMoney } from '../utils/money.js';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="Settings" />
      <div className={styles.sections}>
        <RatesCard />
        <SampleDataCard />
      </div>
    </div>
  );
}

const ROWS = [
  { code: 'KRW', name: 'Korean won' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'KHR', name: 'Cambodian riel' },
];

function RatesCard() {
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

// Load the sample data, or delete everything and start empty
function SampleDataCard() {
  const { resetSampleData, clearAllData } = useFinance();
  // Which confirmation is open: 'sample', 'delete' or null
  const [sheet, setSheet] = useState(null);

  function handleLoadSample() {
    resetSampleData();
    setSheet(null);
  }

  function handleDeleteAll() {
    clearAllData();
    setSheet(null);
  }

  return (
    <Card title="Your data">
      <p className="text-body">
        Expenses and categories are saved in this browser, so they're still here after you close it. Want to try the
        app first? Load the sample data: about two months of made-up expenses.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" icon={RotateCcw} onClick={() => setSheet('sample')}>
          Load sample data
        </Button>
        <Button variant="danger" icon={Trash2} onClick={() => setSheet('delete')}>
          Delete all data
        </Button>
      </div>

      <ConfirmSheet
        open={sheet === 'sample'}
        title="Load the sample data?"
        onClose={() => setSheet(null)}
        onConfirm={handleLoadSample}
        confirmLabel="Load sample data"
        confirmIcon={RotateCcw}
      >
        <p>All your expenses and categories will be replaced with the sample data. This can't be undone.</p>
      </ConfirmSheet>

      <ConfirmSheet
        open={sheet === 'delete'}
        title="Delete all data?"
        onClose={() => setSheet(null)}
        onConfirm={handleDeleteAll}
        confirmLabel="Delete all data"
        confirmIcon={Trash2}
      >
        <p>All your expenses will be deleted and the categories go back to the default ones. This can't be undone.</p>
      </ConfirmSheet>
    </Card>
  );
}
