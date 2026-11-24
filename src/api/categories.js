import { request } from './client.js';
import * as server from '../mock/categories.js';

/** [{ id, name, color, icon, expenseCount, isFallback }] */
export function listCategories(options) {
  return request(() => server.listCategories(), options);
}

export function createCategory(data) {
  return request(() => server.createCategory(data));
}

export function updateCategory(id, data) {
  return request(() => server.updateCategory(id, data));
}

/** Resolves to { movedCount, movedTo }: its expenses are moved to "Other". */
export function deleteCategory(id) {
  return request(() => server.deleteCategory(id));
}
