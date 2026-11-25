// Fake endpoint behind Settings → Reset sample data.
import { resetDb } from './db.js';

export function resetSampleData() {
  resetDb();
}
