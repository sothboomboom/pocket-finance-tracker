import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.jsx';
import { FieldError } from './Feedback.jsx';
import styles from './Sheet.module.css';

//////////////////////////////
// Sheet
//////////////////////////////

/**
 * Bottom sheet on phones, centered dialog on wider screens.
 * The native <dialog> gives focus trapping, an inert background and Escape for free.
 */
export function Sheet({ open, onClose, title, initialFocusRef, children }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  // Escape: let React state close it, so `open` stays the single source of truth.
  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  // Clicks on the dialog itself, outside its content, are backdrop clicks.
  function handleClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <X strokeWidth={2} aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

//////////////////////////////
// ConfirmSheet
//////////////////////////////

/**
 * For destructive actions. Focus starts on Cancel, the safe choice.
 * `session` remounts the body, so an old error never reappears.
 */
export function ConfirmSheet({ open, session, title, onClose, children, ...bodyProps }) {
  const cancelRef = useRef(null);
  return (
    <Sheet open={open} onClose={onClose} title={title} initialFocusRef={cancelRef}>
      <ConfirmBody key={session} cancelRef={cancelRef} onCancel={onClose} {...bodyProps}>
        {children}
      </ConfirmBody>
    </Sheet>
  );
}

/** If onConfirm() throws, the error shows here and the sheet stays open. */
function ConfirmBody({ children, confirmLabel, confirmIcon, cancelRef, onCancel, onConfirm }) {
  const [error, setError] = useState(null);

  function handleConfirm() {
    setError(null);
    try {
      onConfirm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.form}>
      <div className={`${styles.fields} ${styles.confirmBody}`}>
        <div className="text-body">{children}</div>
        {error && (
          <div role="alert">
            <FieldError id="confirm-error">{error}</FieldError>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <div className={`${styles.actions} ${styles.confirmActions}`}>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="dangerSolid" icon={confirmIcon} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
