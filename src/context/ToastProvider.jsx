import { useEffect, useRef, useState } from 'react';
import { ToastContext } from './ToastContext.js';
import { Toast } from '../components/Feedback.jsx';
import { TOAST_DURATION_MS } from '../constants/expenses.js';

// One toast at a time: a new one replaces the current one.
export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const nextId = useRef(1);

  function showToast({ message, tone = 'success' }) {
    clearTimeout(timerRef.current);
    setToast({ id: nextId.current++, message, tone });
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }

  // Stop the timer if the app closes while a toast is showing.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const value = { showToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Always rendered: screen readers only announce changes inside an existing live region */}
      <div role="status" aria-live="polite">
        {toast && <Toast key={toast.id} message={toast.message} tone={toast.tone} />}
      </div>
    </ToastContext.Provider>
  );
}
