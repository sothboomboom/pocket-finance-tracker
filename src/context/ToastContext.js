import { createContext, useContext } from 'react';

// Filled by <ToastProvider>.
export const ToastContext = createContext(null);

/**
 * const { showToast } = useToast();
 * showToast({ message: 'Expense added' });
 * showToast({ message: "Couldn't delete", tone: 'error' });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
