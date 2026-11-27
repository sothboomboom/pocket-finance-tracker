import { CircleAlert } from 'lucide-react';
import styles from './Feedback.module.css';

// What the user sees when something happens: empty states and field errors.

// Nothing to show yet
export function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyCircle} aria-hidden="true">
        <Icon strokeWidth={2} />
      </span>
      <p className={styles.emptyMessage}>{message}</p>
      {action}
    </div>
  );
}

// Icon + message card, e.g. when an expense no longer exists
export function Placeholder({ icon: Icon, children }) {
  return (
    <section className={styles.placeholder}>
      <span className={styles.placeholderCircle} aria-hidden="true">
        <Icon strokeWidth={2} />
      </span>
      <p className="text-muted">{children}</p>
    </section>
  );
}

// Icon + text, so the error isn't shown by color alone.
// Link it to its input with aria-describedby={id}.
export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} className={styles.fieldError}>
      <CircleAlert className={styles.icon} strokeWidth={2} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
