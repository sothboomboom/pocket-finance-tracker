import { useMemo, useState } from 'react';
import { DataContext } from './DataContext.js';
import * as store from '../store/categories.js';
import { resetSampleData as resetStore, clearAllData as clearStore } from '../store/db.js';

/**
 * Shares data across pages:
 * - categories, so a new category appears everywhere at once;
 * - version, bumped after any change. The data hooks depend on it, so every
 *   screen updates itself.
 */
export default function DataProvider({ children }) {
  const [version, setVersion] = useState(0);
  function notifyChange() {
    setVersion((v) => v + 1);
  }

  // Depends on `version` because the expense count of each category changes too.
  const categories = useMemo(() => store.listCategories(), [version]);

  function createCategory(values) {
    const category = store.createCategory(values);
    notifyChange();
    return category;
  }

  function updateCategory(id, values) {
    const category = store.updateCategory(id, values);
    notifyChange();
    return category;
  }

  function deleteCategory(id) {
    const result = store.deleteCategory(id);
    notifyChange();
    return result;
  }

  function resetSampleData() {
    resetStore();
    notifyChange();
  }

  function clearAllData() {
    clearStore();
    notifyChange();
  }

  const value = { version, notifyChange, categories, createCategory, updateCategory, deleteCategory, resetSampleData, clearAllData };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
