import { PageHeader } from '../components/Layout.jsx';
import { RatesCard, SampleDataCard } from '../features/Settings.jsx';
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
