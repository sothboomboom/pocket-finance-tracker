import { useCallback, useMemo, useState } from 'react';
import { DataContext } from './DataContext.js';
import * as store from '../store/categories.js';
import { resetSampleData as resetStore } from '../store/db.js';

/**
 * Shares data across pages:
 * - categories, so a new category appears everywhere at once;
 * - version, bumped after any change. The data hooks depend on it, so every
 *   screen updates itself, even after an Undo clicked on another page.
 */
export default function DataProvider({ children }) {
  const [version, setVersion] = useState(0);
  const notifyChange = useCallback(() => setVersion((v) => v + 1), []);

  // Depends on `version` because the expense count of each category changes too.
  const categories = useMemo(() => store.listCategories(), [version]);

  const createCategory = useCallback(
    (values) => {
      const category = store.createCategory(values);
      notifyChange();
      return category;
    },
    [notifyChange],
  );

  const updateCategory = useCallback(
    (id, values) => {
      const category = store.updateCategory(id, values);
      notifyChange();
      return category;
    },
    [notifyChange],
  );

  const deleteCategory = useCallback(
    (id) => {
      const result = store.deleteCategory(id);
      notifyChange();
      return result;
    },
    [notifyChange],
  );

  const resetSampleData = useCallback(() => {
    resetStore();
    notifyChange();
  }, [notifyChange]);

  const value = useMemo(
    () => ({ version, notifyChange, categories, createCategory, updateCategory, deleteCategory, resetSampleData }),
    [version, notifyChange, categories, createCategory, updateCategory, deleteCategory, resetSampleData],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
