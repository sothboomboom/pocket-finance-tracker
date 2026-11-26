import { PageHeader } from '../components/Layout.jsx';
import { RatesCard, SampleDataCard } from '../features/Settings.jsx';
import { useRates } from '../hooks/useData.js';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { rates, updatedAt, source, status } = useRates();

  return (
    <div className={styles.page}>
      <PageHeader title="Settings" />
      <div className={styles.sections}>
        <RatesCard rates={rates} updatedAt={updatedAt} source={source} status={status} />
        <SampleDataCard />
      </div>
    </div>
  );
}
