// Reading and changing categories.
import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS, CATEGORY_NAME_MAX_LENGTH } from '../constants/categories.js';
import { db, save, findCategory, formError, FALLBACK_CATEGORY_NAME } from './db.js';

const isFallback = (category) => category.name === FALLBACK_CATEGORY_NAME;

/** Returns clean values, or throws an error with a message per field. */
function checkCategory(values, ownId = null) {
  const errors = {};
  const name = (values.name ?? '').trim().replace(/\s+/g, ' ');
  if (!name) errors.name = 'Enter a name';
  else if (name.length > CATEGORY_NAME_MAX_LENGTH) errors.name = `Keep the name under ${CATEGORY_NAME_MAX_LENGTH} characters`;
  // Case-insensitive, so "food" can't sit next to "Food".
  else if (db.categories.some((c) => c.id !== ownId && c.name.toLowerCase() === name.toLowerCase())) {
    errors.name = 'You already have a category with this name';
  }
  if (!CATEGORY_COLOR_OPTIONS.some((o) => o.value === values.color)) errors.color = 'Choose a color';
  if (!CATEGORY_ICON_OPTIONS.some((o) => o.name === values.icon)) errors.icon = 'Choose an icon';
  if (Object.keys(errors).length > 0) throw formError(errors);
  return { name, color: values.color, icon: values.icon };
}

/** "Other" always comes last; each category knows how many expenses it has. */
export function listCategories() {
  return [...db.categories]
    .sort((a, b) => isFallback(a) - isFallback(b) || a.id - b.id)
    .map((c) => ({
      ...c,
      expenseCount: db.expenses.filter((e) => e.categoryId === c.id).length,
      isFallback: isFallback(c),
    }));
}

export function createCategory(values) {
  const category = { id: db.nextCategoryId++, ...checkCategory(values) };
  db.categories.push(category);
  save();
  return category;
}

export function updateCategory(id, values) {
  const category = findCategory(id);
  const clean = checkCategory(values, category.id);
  if (isFallback(category) && clean.name !== FALLBACK_CATEGORY_NAME) {
    throw formError({ name: `"${FALLBACK_CATEGORY_NAME}" can't be renamed. Other categories move their expenses here.` });
  }
  Object.assign(category, clean);
  save();
  return category;
}

/** Moves the category's expenses to "Other", then deletes it. */
export function deleteCategory(id) {
  const category = findCategory(id);
  if (isFallback(category)) throw new Error(`"${FALLBACK_CATEGORY_NAME}" can't be deleted.`);
  const fallback = db.categories.find(isFallback);
  const moved = db.expenses.filter((e) => e.categoryId === category.id);
  for (const expense of moved) expense.categoryId = fallback.id;
  db.categories = db.categories.filter((c) => c !== category);
  save();
  return { movedCount: moved.length, movedTo: FALLBACK_CATEGORY_NAME };
}
