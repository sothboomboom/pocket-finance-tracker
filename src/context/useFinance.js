import { createContext, useContext } from 'react';

// Filled by <FinanceProvider> in FinanceContext.jsx.
export const FinanceContext = createContext(null);

/** const { categories, listExpenses, createExpense } = useFinance(); */
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used inside <FinanceProvider>');
  return context;
}
