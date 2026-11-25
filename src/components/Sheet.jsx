import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import styles from './Sheet.module.css';

/**
 * Bottom sheet on phones, centered dialog on wider screens.
 * The native <dialog> gives focus trapping, an inert background and Escape for free.
 */
export default function Sheet({ open, onClose, title, initialFocusRef, children }) {
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
      // Close for real after the exit animation (see handleAnimationEnd).
      setClosing(true);
    }
  }, [open, initialFocusRef]);

  function handleAnimationEnd(event) {
    if (closing && event.target === dialogRef.current) {
      dialogRef.current.close();
      setClosing(false);
    }
  }

  // Let React state close it, so the exit animation still plays.
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
