// `decimals` drives formatting and validation: KRW, JPY and KHR have no everyday decimals.
export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', decimals: 2 },
  KRW: { code: 'KRW', symbol: '₩', decimals: 0 },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0 },
  CNY: { code: 'CNY', symbol: '元', decimals: 2 },
  KHR: { code: 'KHR', symbol: '៛', decimals: 0 },
};

// Order in the currency picker
export const CURRENCY_CODES = ['USD', 'KRW', 'JPY', 'CNY', 'KHR'];

export const BASE_CURRENCY = 'USD';
