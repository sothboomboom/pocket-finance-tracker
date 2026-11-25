import { useCallback, useMemo, useState } from 'react';
import { DataContext } from './DataContext.js';
import * as categoriesApi from '../api/categories.js';
import * as dataApi from '../api/data.js';
import { useApiData } from '../hooks/useApiData.js';

/**
 * Shares data across pages:
 * - categories, loaded once, so a new category appears everywhere at once;
 * - version, bumped after any change. Data hooks depend on it, so every
 *   screen reloads itself, even after an Undo clicked on another page.
 */
export default function DataProvider({ children }) {
  const [version, setVersion] = useState(0);
  const notifyChange = useCallback(() => setVersion((v) => v + 1), []);

  // Depends on `version` because expense counts per category change too.
  const { data, status, error, reload } = useApiData((options) => categoriesApi.listCategories(options), [version], {
    keepPrevious: true,
  });

  const createCategory = useCallback(
    async (input) => {
      const category = await categoriesApi.createCategory(input);
      notifyChange();
      return category;
    },
    [notifyChange],
  );

  const updateCategory = useCallback(
    async (id, input) => {
      const category = await categoriesApi.updateCategory(id, input);
      notifyChange();
      return category;
    },
    [notifyChange],
  );

  const deleteCategory = useCallback(
    async (id) => {
      const result = await categoriesApi.deleteCategory(id);
      notifyChange();
      return result;
    },
    [notifyChange],
  );

  const resetSampleData = useCallback(async () => {
    await dataApi.resetSampleData();
    notifyChange();
  }, [notifyChange]);

  const value = useMemo(
    () => ({
      version,
      notifyChange,
      categories: data ?? [],
      categoriesStatus: status,
      categoriesError: error,
      reloadCategories: reload,
      createCategory,
      updateCategory,
      deleteCategory,
      resetSampleData,
    }),
    [version, notifyChange, data, status, error, reload, createCategory, updateCategory, deleteCategory, resetSampleData],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
