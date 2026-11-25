import ExpenseRow from '../../components/ExpenseRow.jsx';
import { formatDayLabel, groupByDay } from '../../utils/dates.js';
import styles from './ExpenseList.module.css';

export default function ExpenseList({ expenses }) {
  return (
    <div className={styles.list}>
      {groupByDay(expenses).map(({ date, items }) => (
        <section key={date} className={styles.group} aria-labelledby={`day-${date}`}>
          <h2 id={`day-${date}`} className={styles.day}>
            {formatDayLabel(date)}
          </h2>
          <ul className={styles.rows}>
            {items.map((expense) => (
              <li key={expense.id}>
                <ExpenseRow expense={expense} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
