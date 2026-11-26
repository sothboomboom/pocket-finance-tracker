import { useState } from 'react';
import { PageHeader } from '../components/Layout.jsx';
import CategoryList from '../features/categories/CategoryList.jsx';
import CategorySheet from '../features/categories/CategorySheet.jsx';
import { useCategories } from '../hooks/useData.js';
import { useSheet } from '../hooks/useSheet.js';
import { useToast } from '../context/ToastContext.js';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const { categories, status, error, reload, createCategory, updateCategory, deleteCategory } = useCategories();
  const sheet = useSheet();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(null); // null means adding

  function openSheet(category = null) {
    setEditing(category);
    sheet.openSheet();
  }

  async function handleSubmit(values) {
    if (editing) {
      await updateCategory(editing.id, values);
      showToast({ message: 'Changes saved' });
    } else {
      await createCategory(values);
      showToast({ message: 'Category added' });
    }
    sheet.closeSheet();
  }

  async function handleDelete(category) {
    const { movedCount, movedTo } = await deleteCategory(category.id);
    sheet.closeSheet();
    showToast({
      message:
        movedCount > 0
          ? `Category deleted. ${movedCount} ${movedCount === 1 ? 'expense' : 'expenses'} moved to ${movedTo}.`
          : 'Category deleted',
    });
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Categories" />
      <CategoryList
        categories={categories}
        status={status}
        error={error}
        onRetry={reload}
        onAdd={() => openSheet()}
        onSelect={openSheet}
      />

      <CategorySheet
        open={sheet.open}
        session={sheet.session}
        category={editing}
        onClose={sheet.closeSheet}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}
