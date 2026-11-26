import { CircleAlert, RotateCcw } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { Card, Tag } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Feedback.jsx';
import { ConfirmSheet } from '../components/Sheet.jsx';
import { CURRENCIES } from '../constants/currencies.js';
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
  { code: 'KHR', name: 'Cambodian riel', fixed: true },
];

// Warns when the built-in rates are used because the rate service was unreachable.
function RatesStatus({ updatedAt, source }) {
  if (source === 'fallback') {
    return (
      <span className={styles.warning}>
        <CircleAlert className={styles.warningIcon} strokeWidth={2} aria-hidden="true" />
        Couldn't reach the rate service. Using built-in rates.
      </span>
    );
  }
  const date = new Date(updatedAt);
  const stale = differenceInHours(new Date(), date) >= 24;
  return (
    <span>
      Rates updated: {format(date, 'MMM d')}
      {stale && " · couldn't refresh today"}
    </span>
  );
}

export function RatesCard({ rates, updatedAt, source, status }) {
  return (
    <Card
      title="Exchange rates"
      subtitle={status === 'success' ? <RatesStatus updatedAt={updatedAt} source={source} /> : 'Loading rates…'}
    >
      {status === 'loading' && <Skeleton className={styles.skeleton} />}
      {status === 'success' && (
        <>
          <ul className={styles.list}>
            {ROWS.map(({ code, name, fixed }) => (
              <li key={code} className={styles.row}>
                <span className={styles.symbol} aria-hidden="true">
                  {CURRENCIES[code].symbol}
                </span>
                <span className={styles.currency}>
                  <span className="text-strong">{code}</span>
                  <span className="text-meta">{name}</span>
                </span>
                {fixed && <Tag>Fixed</Tag>}
                <span className={`text-strong tabular-nums`}>
                  $1 = {formatMoney(1 / rates[code], code)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-meta">
            Each expense keeps the rate from the day you saved it, so past totals never change.
          </p>
        </>
      )}
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

  async function handleReset() {
    await resetSampleData();
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
        loadingText="Resetting…"
      >
        <p>All your expenses and categories will be replaced with the sample data. This can't be undone.</p>
      </ConfirmSheet>
    </Card>
  );
}
