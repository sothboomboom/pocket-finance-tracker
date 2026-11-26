import { RotateCcw } from 'lucide-react';
import { Card } from '../../components/UI.jsx';
import { Button } from '../../components/Button.jsx';
import { ConfirmSheet } from '../../components/Sheet.jsx';
import { useAppData } from '../../context/DataContext.js';
import { useSheet } from '../../hooks/useSheet.js';
import { useToast } from '../../context/ToastContext.js';
import styles from './SampleDataCard.module.css';

export default function SampleDataCard() {
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
      <p className={styles.text}>
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
