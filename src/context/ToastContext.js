import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

/**
 * const { showToast } = useToast();
 * showToast({ message: 'Expense added' });
 * showToast({ message: 'Expense deleted', action: { label: 'Undo', onClick: undo } });
 * showToast({ message: "Couldn't delete", tone: 'error' });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
