import { request } from './client.js';
import * as server from '../mock/summary.js';

/** Dashboard totals for the day, week or month that contains `date`. */
export function getSummary({ period, date }, options) {
  return request(() => server.getSummary({ period, date }), options);
}
