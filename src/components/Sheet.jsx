import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.jsx';
import { FieldError } from './Feedback.jsx';
import styles from './Sheet.module.css';

//////////////////////////////
// Sheet
//////////////////////////////

export function Sheet({ open, onClose, title, initialFocusRef, children }) {
  const dialogRef = useRef(null);
  const [closing, setClosing] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) {
      setClosing(false);
      dialog.showModal();
      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      setClosing(true);
    }
  }, [open, initialFocusRef]);

  function handleAnimationEnd(event) {
    if (closing && event.target === dialogRef.current) {
      dialogRef.current.close();
      setClosing(false);
    }
  }

  function handleCancel(event) {
    event.preventDefault();
    onClose();
  }

  function handleClick(event) {
    if (event.target === dialogRef.current) onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.sheet} ${closing ? styles.closing : ''}`}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
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

function ConfirmBody({ children, confirmLabel, confirmIcon, loadingText, cancelRef, onCancel, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setBusy(false);
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
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="dangerSolid" icon={confirmIcon} onClick={handleConfirm} loading={busy} loadingText={loadingText}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
