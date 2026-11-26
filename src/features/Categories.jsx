import { Plus, ChevronRight, Trash2, Lock, Check } from 'lucide-react';
import { useEffect, useRef, useState, useId } from 'react';
import { Card, CategoryIcon } from '../components/UI.jsx';
import { Button } from '../components/Button.jsx';
import { FieldError } from '../components/Feedback.jsx';
import { Sheet } from '../components/Sheet.jsx';
import { CATEGORY_NAME_MAX_LENGTH, CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS } from '../constants/categories.js';
import sheetStyles from '../components/Sheet.module.css';
import styles from './Categories.module.css';

// Everything on the Categories page: the list, the add/edit sheet with its form and pickers, and the delete confirmation.

//////////////////////////////
// CategoryList
//////////////////////////////

export function CategoryList({ categories, onAdd, onSelect }) {
  return (
    <Card
      title="Your categories"
      subtitle="Tap a category to rename it or change its color and icon."
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
              <CategoryIcon icon={category.icon} color={category.color} />
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

//////////////////////////////
// CategorySheet
//////////////////////////////

/** Delete swaps this dialog's content for a confirmation, instead of stacking a second dialog. */
export function CategorySheet({ open, session, category, onClose, onSubmit, onDelete }) {
  const nameRef = useRef(null);
  const cancelRef = useRef(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => setConfirming(false), [session]);

  // Move focus to the step that just appeared, for keyboard and screen-reader users.
  useEffect(() => {
    if (!open) return;
    (confirming ? cancelRef : nameRef).current?.focus();
  }, [confirming, open]);

  let title = 'Add category';
  if (confirming) title = 'Delete category?';
  else if (category) title = 'Edit category';

  return (
    <Sheet open={open} onClose={onClose} title={title} initialFocusRef={nameRef}>
      {confirming ? (
        <DeleteCategoryConfirm
          category={category}
          cancelRef={cancelRef}
          onCancel={() => setConfirming(false)}
          onConfirm={() => onDelete(category)}
        />
      ) : (
        <CategoryForm
          key={session}
          category={category}
          nameRef={nameRef}
          onSubmit={onSubmit}
          onDelete={() => setConfirming(true)}
        />
      )}
    </Sheet>
  );
}

//////////////////////////////
// CategoryForm
//////////////////////////////

const NEW_CATEGORY = { name: '', color: 'teal', icon: 'Sparkles' };

/** Field errors from a rejected onSubmit show under their fields. */
function CategoryForm({ category, onSubmit, onDelete, nameRef }) {
  const isEdit = Boolean(category);
  const isFallback = category?.isFallback ?? false;
  const [values, setValues] = useState(() =>
    category ? { name: category.name, color: category.color, icon: category.icon } : NEW_CATEGORY,
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    const name = values.name.trim();
    if (!name) {
      setErrors({ name: 'Enter a name' });
      nameRef.current?.focus();
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSubmit({ ...values, name });
    } catch (err) {
      const fieldErrors = err.fieldErrors ?? {};
      setErrors(fieldErrors);
      if (Object.keys(fieldErrors).length === 0) setFormError(err.message);
      if (fieldErrors.name) nameRef.current?.focus();
      setSaving(false);
    }
  }

  return (
    <form className={sheetStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={sheetStyles.fields}>
        <div className={styles.preview} aria-hidden="true">
          <CategoryIcon icon={values.icon} color={values.color} size="md" />
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
          <ColorPicker
            value={values.color}
            onChange={(color) => setField('color', color)}
            error={errors.color}
            errorId="category-color-error"
          />
          <FieldError id="category-color-error">{errors.color}</FieldError>
        </div>

        <div className={sheetStyles.field}>
          <IconPicker
            value={values.icon}
            color={values.color}
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
            <Button variant="danger" icon={Trash2} onClick={onDelete} disabled={saving}>
              Delete
            </Button>
          )}
          <Button type="submit" className={sheetStyles.save} loading={saving} loadingText="Saving…">
            {isEdit ? 'Save changes' : 'Add category'}
          </Button>
        </div>
      </div>
    </form>
  );
}

//////////////////////////////
// ColorPicker
//////////////////////////////

// The selected swatch gets a check mark and its name is in the label, so it isn't color-only.
function ColorPicker({ value, onChange, error, errorId }) {
  const name = useId();
  const selected = CATEGORY_COLOR_OPTIONS.find((option) => option.value === value);

  return (
    <fieldset className={styles.fieldset} aria-describedby={error ? errorId : undefined}>
      <legend className="field-legend">
        Color {selected && <span className="text-muted">· {selected.label}</span>}
      </legend>
      <div className={styles.grid}>
        {CATEGORY_COLOR_OPTIONS.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <span key={option.value} className={styles.option}>
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={styles.input}
                aria-label={option.label}
              />
              <label
                htmlFor={id}
                className={styles.swatch}
                style={{ '--swatch': `var(--cat-${option.value}-chart)` }}
              >
                <Check className={styles.check} strokeWidth={3} aria-hidden="true" />
              </label>
            </span>
          );
        })}
      </div>
    </fieldset>
  );
}

//////////////////////////////
// IconPicker
//////////////////////////////

// Icons are tinted with the chosen color, so you preview both together.
function IconPicker({ value, color, onChange, error, errorId }) {
  const name = useId();
  const selected = CATEGORY_ICON_OPTIONS.find((option) => option.name === value);

  return (
    <fieldset
      className={styles.iconPickerFieldset}
      aria-describedby={error ? errorId : undefined}
      style={{ '--tint': `var(--cat-${color}-bg)`, '--ink': `var(--cat-${color}-icon)` }}
    >
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

//////////////////////////////
// DeleteCategoryConfirm
//////////////////////////////

function DeleteCategoryConfirm({ category, onCancel, onConfirm, cancelRef }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const count = category.expenseCount;

  async function handleConfirm() {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className={sheetStyles.form}>
      <div className={`${sheetStyles.fields} ${styles.body}`}>
        <div className={styles.category}>
          <CategoryIcon icon={category.icon} color={category.color} size="md" />
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
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="dangerSolid" icon={Trash2} onClick={handleConfirm} loading={deleting} loadingText="Deleting…">
            Delete category
          </Button>
        </div>
      </div>
    </div>
  );
}
