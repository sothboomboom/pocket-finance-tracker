import { useState } from 'react';
import { PreferencesContext } from './PreferencesContext.js';
import { getLastCurrency, setLastCurrency as saveLastCurrency } from '../utils/storage.js';

export default function PreferencesProvider({ children }) {
  // Initializer function, so localStorage is read only on the first render.
  const [lastCurrency, setLastCurrencyState] = useState(getLastCurrency);

  function setLastCurrency(code) {
    saveLastCurrency(code);
    setLastCurrencyState(code);
  }

  const value = { lastCurrency, setLastCurrency };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
