import { useAppData } from './useAppData.js';

/** Categories come from DataContext, so every page shares one copy. */
export function useCategories() {
  const {
    categories,
    categoriesStatus,
    categoriesError,
    reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAppData();

  return {
    categories,
    status: categoriesStatus,
    error: categoriesError,
    reload: reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
