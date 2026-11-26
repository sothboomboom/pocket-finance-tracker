import { createContext, useContext } from 'react';

export const DataContext = createContext(null);

export function useAppData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useAppData must be used inside <DataProvider>');
  return context;
}
