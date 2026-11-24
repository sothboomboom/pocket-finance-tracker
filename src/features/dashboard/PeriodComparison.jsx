import { ArrowDown, ArrowUp, Equal, Minus } from 'lucide-react';
import styles from './PeriodComparison.module.css';

const PREVIOUS_NAMES = {
  current: { day: 'yesterday', week: 'last week', month: 'last month' },
  past: { day: 'the day before', week: 'the week before', month: 'the month before' },
};

/** "↓ 12% vs last week". The arrow and words carry the meaning; color only tints the icon. */
export default function PeriodComparison({ total, previousTotal, period, isCurrentPeriod }) {
  const previousName = PREVIOUS_NAMES[isCurrentPeriod ? 'current' : 'past'][period];

  let Icon;
  let text;
  let tone = 'neutral';
  if (previousTotal === 0) {
    if (total === 0) return null;
    Icon = Minus;
    text = `Nothing spent ${previousName}`;
  } else {
    const change = Math.round(((total - previousTotal) / previousTotal) * 100);
    if (change === 0) {
      Icon = Equal;
      text = `Same as ${previousName}`;
    } else {
      Icon = change < 0 ? ArrowDown : ArrowUp;
      tone = change < 0 ? 'down' : 'up';
      text = (
        <>
          <span className="visually-hidden">{change < 0 ? 'Down' : 'Up'} </span>
          {Math.abs(change)}% vs {previousName}
        </>
      );
    }
  }

  return (
    <p className={styles.comparison}>
      <Icon className={`${styles.icon} ${styles[tone]}`} strokeWidth={2.5} aria-hidden="true" />
      <span>{text}</span>
    </p>
  );
}
