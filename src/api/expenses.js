import { request } from './client.js';
import * as server from '../mock/expenses.js';

/** filters: { from, to, categoryId?, paymentMethod?, q? } */
export function listExpenses(filters, options) {
  return request(() => server.listExpenses(filters), options);
}

/** Rejects with a 404 ApiError if the expense doesn't exist. */
export function getExpense(id, options) {
  return request(() => server.getExpense(id), options);
}

export function createExpense(data) {
  return request(() => server.createExpense(data));
}

export function updateExpense(id, data) {
  return request(() => server.updateExpense(id, data));
}

export function deleteExpense(id, options) {
  return request(() => server.deleteExpense(id), options);
}

/** Undo for a delete: restores the expense with its original id and rate. */
export function restoreExpense(expense) {
  return request(() => server.restoreExpense(expense));
}
