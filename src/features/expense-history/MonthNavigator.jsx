import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from '../../components/IconButton.jsx';
import styles from './MonthNavigator.module.css';

// Next is disabled on the current month: there are no future expenses.
export default function MonthNavigator({ label, onPrevious, onNext, canGoNext }) {
  return (
    <div className={styles.navigator}>
      <IconButton icon={ChevronLeft} label="Previous month" onClick={onPrevious} />
      {/* aria-live: screen readers announce the new month */}
      <h2 className={styles.title} aria-live="polite">
        {label}
      </h2>
      <IconButton icon={ChevronRight} label="Next month" onClick={onNext} disabled={!canGoNext} />
    </div>
  );
}
