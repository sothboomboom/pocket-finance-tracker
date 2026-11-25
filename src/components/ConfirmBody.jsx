import { useState } from 'react';
import Button from './Button.jsx';
import FieldError from './FieldError.jsx';
import formStyles from './SheetForm.module.css';
import styles from './ConfirmBody.module.css';

/** If onConfirm() rejects, the error shows here and the sheet stays open. */
export default function ConfirmBody({ children, confirmLabel, confirmIcon, loadingText, cancelRef, onCancel, onConfirm }) {
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
    <div className={formStyles.form}>
      <div className={`${formStyles.fields} ${styles.body}`}>
        <div className={styles.message}>{children}</div>
        {error && (
          <div role="alert">
            <FieldError id="confirm-error">{error}</FieldError>
          </div>
        )}
      </div>
      <div className={formStyles.footer}>
        <div className={`${formStyles.actions} ${styles.actions}`}>
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
