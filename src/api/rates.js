import { request } from './client.js';
import * as server from '../mock/rates.js';

/** { base: 'USD', rates: { USD, KRW, JPY, CNY, KHR }, updatedAt, source: 'live' | 'cache' | 'fallback' } */
export function getRates(options) {
  return request(() => server.getRates(), options);
}
