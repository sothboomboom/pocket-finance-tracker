import { CircleAlert, CircleCheck } from 'lucide-react';
import styles from './Feedback.module.css';

// What the user sees while waiting or when something happens: empty states, loading skeletons, field errors and the toast.

//////////////////////////////
// EmptyState
//////////////////////////////

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

//////////////////////////////
// Placeholder
//////////////////////////////

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

//////////////////////////////
// Skeleton
//////////////////////////////

// Size it with className.
export function Skeleton({ className = '' }) {
  return <span className={`${styles.skeleton} ${className}`} aria-hidden="true" />;
}

//////////////////////////////
// FieldError
//////////////////////////////

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

//////////////////////////////
// Toast
//////////////////////////////

// Rendered by ToastProvider; show one with useToast().
export function Toast({ message, tone, action, onDismiss }) {
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;

  function handleAction() {
    action.onClick();
    onDismiss();
  }

  return (
    <div className={`${styles.toast} ${styles[tone]}`}>
      <Icon className={styles.toastIcon} strokeWidth={2} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
      {action && (
        <button type="button" className={styles.action} onClick={handleAction}>
          {action.label}
        </button>
      )}
    </div>
  );
}
