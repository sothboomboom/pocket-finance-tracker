import { request } from './client.js';
import * as server from '../mock/data.js';

/** Deletes all saved expenses and categories and loads the sample data again. */
export function resetSampleData() {
  return request(() => server.resetSampleData());
}
