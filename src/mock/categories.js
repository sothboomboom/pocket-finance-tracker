// Fake categories endpoints.
import { ApiError } from '../api/client.js';
import { categories, expenses, findCategory, newCategoryId, saveDb, FALLBACK_CATEGORY_NAME } from './db.js';
import { validateCategory, validateId } from './validation.js';

const isFallback = (name) => name === FALLBACK_CATEGORY_NAME;

function toCategory(row) {
  return {
    ...row,
    expenseCount: expenses.filter((e) => e.categoryId === row.id).length,
    isFallback: isFallback(row.name),
  };
}

// Case-insensitive, so "food" can't sit next to "Food".
function assertNameIsFree(name, ownId = null) {
  const taken = categories.some((c) => c.id !== ownId && c.name.toLowerCase() === name.toLowerCase());
  if (taken) {
    throw new ApiError(409, 'Please fix the highlighted fields', {
      fieldErrors: { name: 'You already have a category with this name' },
    });
  }
}

/** "Other" always sorts last; the rest keep their creation order. */
export function listCategories() {
  return [...categories]
    .sort((a, b) => isFallback(a.name) - isFallback(b.name) || a.id - b.id)
    .map(toCategory);
}

export function createCategory(body) {
  const input = validateCategory(body);
  assertNameIsFree(input.name);
  const row = { id: newCategoryId(), ...input };
  categories.push(row);
  saveDb();
  return toCategory(row);
}

export function updateCategory(id, body) {
  const row = findCategory(validateId(id));
  if (!row) throw new ApiError(404, 'Category not found');
  const input = validateCategory(body);
  if (isFallback(row.name) && input.name !== FALLBACK_CATEGORY_NAME) {
    throw new ApiError(400, 'Please fix the highlighted fields', {
      fieldErrors: {
        name: `"${FALLBACK_CATEGORY_NAME}" can't be renamed. Other categories move their expenses here.`,
      },
    });
  }
  assertNameIsFree(input.name, row.id);
  Object.assign(row, input);
  saveDb();
  return toCategory(row);
}

/** Moves the category's expenses to "Other", then deletes it. */
export function deleteCategory(id) {
  const index = categories.findIndex((c) => c.id === validateId(id));
  if (index === -1) throw new ApiError(404, 'Category not found');
  const row = categories[index];
  if (isFallback(row.name)) {
    throw new ApiError(400, `"${FALLBACK_CATEGORY_NAME}" can't be deleted. Other categories move their expenses here.`);
  }

  const fallback = categories.find((c) => isFallback(c.name));
  let movedCount = 0;
  for (const expense of expenses) {
    if (expense.categoryId === row.id) {
      expense.categoryId = fallback.id;
      movedCount++;
    }
  }
  categories.splice(index, 1);
  saveDb();
  return { movedCount, movedTo: FALLBACK_CATEGORY_NAME };
}
