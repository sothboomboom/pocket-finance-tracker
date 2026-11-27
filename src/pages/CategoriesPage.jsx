import { useEffect, useRef, useState } from 'react';
import { Plus, ChevronRight, Trash2, Lock } from 'lucide-react';
import { PageHeader } from '../components/Layout.jsx';
import { Card, CategoryIcon } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { FieldError } from '../components/Feedback.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { useFinance } from '../context/useFinance.js';
import { CATEGORY_NAME_MAX_LENGTH, CATEGORY_ICON_OPTIONS } from '../data/categories.js';
import sheetStyles from '../components/Sheet.module.css';
import styles from './CategoriesPage.module.css';

// Everything on the Categories page: the list, the add/edit sheet with its form and pickers, and the delete confirmation.

export default function CategoriesPage() {
  const { categories, createCategory, updateCategory, deleteCategory } = useFinance();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null means adding

  function openSheet(category = null) {
    setEditing(category);
    setSheetOpen(true);
  }

  function handleSubmit(values) {
    if (editing) updateCategory(editing.id, values);
    else createCategory(values);
    setSheetOpen(false);
  }

  function handleDelete(category) {
    deleteCategory(category.id);
    setSheetOpen(false);
  }

  return (
    <div className={styles.page}>
      <PageHeader title="Categories" />
      <CategoryList categories={categories} onAdd={() => openSheet()} onSelect={openSheet} />

      <CategorySheet
        open={sheetOpen}
        category={editing}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </div>
  );
}

function CategoryList({ categories, onAdd, onSelect }) {
  return (
    <Card
      title="Your categories"
      subtitle="Tap a category to rename it or change its icon."
      action={
        <Button variant="secondary" icon={Plus} onClick={onAdd}>
          Add
        </Button>
      }
    >
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id}>
            <button type="button" className={styles.row} onClick={() => onSelect(category)}>
              <CategoryIcon icon={category.icon} />
              <span className={styles.main}>
                <span className="text-name">{category.name}</span>
                <span className="text-meta">
                  {category.expenseCount} {category.expenseCount === 1 ? 'expense' : 'expenses'}
                </span>
              </span>
              <ChevronRight className={styles.chevron} strokeWidth={2} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Delete swaps this dialog's content for a confirmation, instead of stacking a second dialog. */
function CategorySheet({ open, category, onClose, onSubmit, onDelete }) {
  const nameRef = useRef(null);
  const cancelRef = useRef(null);
  const [confirming, setConfirming] = useState(false);

  // Move focus to the step that just appeared, for keyboard and screen-reader users.
  useEffect(() => {
    if (!open) return;
    (confirming ? cancelRef : nameRef).current?.focus();
  }, [confirming, open]);

  // Always start on the form the next time the sheet opens.
  function close() {
    setConfirming(false);
    onClose();
  }

  function confirmDelete() {
    onDelete(category);
    setConfirming(false);
  }

  let title = 'Add category';
  if (confirming) title = 'Delete category?';
  else if (category) title = 'Edit category';

  return (
    <Sheet open={open} onClose={close} title={title} initialFocusRef={nameRef}>
      {confirming ? (
        <DeleteCategoryConfirm
          category={category}
          cancelRef={cancelRef}
          onCancel={() => setConfirming(false)}
          onConfirm={confirmDelete}
        />
      ) : (
        <CategoryForm
          category={category}
          nameRef={nameRef}
          onSubmit={onSubmit}
          onDelete={() => setConfirming(true)}
        />
      )}
    </Sheet>
  );
}

const NEW_CATEGORY = { name: '', icon: 'Sparkles' };

/** Field errors from a rejected onSubmit show under their fields. */
function CategoryForm({ category, onSubmit, onDelete, nameRef }) {
  const isEdit = Boolean(category);
  const isFallback = category?.isFallback ?? false;
  const [values, setValues] = useState(() =>
    category ? { name: category.name, icon: category.icon } : NEW_CATEGORY,
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    try {
      onSubmit(values);
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      if (fieldErrors.name) nameRef.current?.focus();
    }
  }

  return (
    <form className={sheetStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={sheetStyles.fields}>
        <div className={styles.preview} aria-hidden="true">
          <CategoryIcon icon={values.icon} size="md" />
          <span className={styles.previewName}>{values.name.trim() || 'New category'}</span>
        </div>

        <div className={sheetStyles.field}>
          <label htmlFor="category-name" className="field-label">
            Name
          </label>
          <input
            ref={nameRef}
            id="category-name"
            type="text"
            className={sheetStyles.input}
            value={values.name}
            maxLength={CATEGORY_NAME_MAX_LENGTH}
            onChange={(event) => setField('name', event.target.value)}
            readOnly={isFallback}
            autoComplete="off"
            placeholder="e.g. Coffee"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={isFallback ? 'category-name-hint' : errors.name ? 'category-name-error' : undefined}
          />
          {isFallback && (
            <p id="category-name-hint" className={styles.hint}>
              <Lock className={styles.hintIcon} strokeWidth={2} aria-hidden="true" />
              "Other" can't be renamed or deleted. Deleted categories move their expenses here.
            </p>
          )}
          <FieldError id="category-name-error">{errors.name}</FieldError>
        </div>

        <div className={sheetStyles.field}>
          <IconPicker
            value={values.icon}
            onChange={(icon) => setField('icon', icon)}
            error={errors.icon}
            errorId="category-icon-error"
          />
          <FieldError id="category-icon-error">{errors.icon}</FieldError>
        </div>
      </div>

      <div className={sheetStyles.footer}>
        {formError && (
          <div role="alert">
            <FieldError id="category-form-error">{formError}</FieldError>
          </div>
        )}
        <div className={sheetStyles.actions}>
          {isEdit && !isFallback && (
            <Button variant="danger" icon={Trash2} onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button type="submit" className={sheetStyles.save}>
            {isEdit ? 'Save changes' : 'Add category'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function IconPicker({ value, onChange, error, errorId }) {
  const name = 'icon';
  const selected = CATEGORY_ICON_OPTIONS.find((option) => option.name === value);

  return (
    <fieldset className={styles.iconPickerFieldset} aria-describedby={error ? errorId : undefined}>
      <legend className="field-legend">
        Icon {selected && <span className="text-muted">· {selected.label}</span>}
      </legend>
      <div className={styles.iconPickerGrid}>
        {CATEGORY_ICON_OPTIONS.map(({ name: iconName, label, Icon }) => {
          const id = `${name}-${iconName}`;
          return (
            <span key={iconName} className={styles.iconPickerOption}>
              <input
                type="radio"
                id={id}
                name={name}
                value={iconName}
                checked={value === iconName}
                onChange={() => onChange(iconName)}
                className={styles.iconPickerInput}
                aria-label={label}
              />
              <label htmlFor={id} className={styles.tile}>
                <Icon strokeWidth={2} aria-hidden="true" />
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}

function DeleteCategoryConfirm({ category, onCancel, onConfirm, cancelRef }) {
  const [error, setError] = useState(null);
  const count = category.expenseCount;

  function handleConfirm() {
    setError(null);
    try {
      onConfirm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={sheetStyles.form}>
      <div className={`${sheetStyles.fields} ${styles.body}`}>
        <div className={styles.category}>
          <CategoryIcon icon={category.icon} size="md" />
          <span className={styles.deleteCategoryConfirmName}>{category.name}</span>
        </div>
        <p className="text-body">
          {count > 0
            ? `Its ${count} ${count === 1 ? 'expense' : 'expenses'} will move to "Other". `
            : "It doesn't have any expenses. "}
          This can't be undone.
        </p>
        {error && (
          <div role="alert">
            <FieldError id="delete-category-error">{error}</FieldError>
          </div>
        )}
      </div>
      <div className={sheetStyles.footer}>
        <div className={`${sheetStyles.actions} ${styles.actions}`}>
          <Button ref={cancelRef} variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="dangerSolid" icon={Trash2} onClick={handleConfirm}>
            Delete category
          </Button>
        </div>
      </div>
    </div>
  );
}
