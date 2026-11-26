// The data the app saves: categories and expenses, kept in localStorage.
// The first visit (or Settings → Reset) starts from the sample data below.
import { format, setHours, startOfToday, subDays } from 'date-fns';
import { convertToUsd } from '../utils/money.js';
import { RATES_TO_USD } from './rates.js';

export const FALLBACK_CATEGORY_NAME = 'Other';

// Bump the version if the saved shape changes, so old data isn't misread.
const STORAGE_KEY = 'pocket:data:v1';

//////////////////////////////
// Sample data
//////////////////////////////

const SAMPLE_CATEGORIES = [
  { name: 'Food', icon: 'UtensilsCrossed' },
  { name: 'Entertainment', icon: 'Clapperboard' },
  { name: 'Travel', icon: 'Plane' },
  { name: 'Gas', icon: 'Fuel' },
  { name: 'Shopping', icon: 'ShoppingBag' },
  { name: 'Bills', icon: 'Receipt' },
  { name: 'Health', icon: 'HeartPulse' },
  { name: 'Subscriptions', icon: 'Repeat' },
  { name: 'Other', icon: 'Sparkles' }, // required: deleted categories move their expenses here
];

// [days ago, hour recorded, category, amount, currency, paymentMethod, note]
const SAMPLE_EXPENSES = [
  [0, 8, 'Food', 2.5, 'USD', 'cash', 'Iced coffee'],
  [0, 12, 'Food', 16000, 'KHR', 'cash', 'Lok lak for lunch'],
  [0, 18, 'Gas', 5, 'USD', 'cash', 'Moto fuel'],
  [1, 9, 'Food', 6000, 'KHR', 'cash', 'Num pang'],
  [1, 20, 'Entertainment', 7.5, 'USD', 'bank', 'Movie night'],
  [2, 13, 'Shopping', 24.99, 'USD', 'bank', 'Running shoes (sale)'],
  [2, 19, 'Food', 12000, 'KHR', 'cash', 'Dinner at the night market'],
  [3, 10, 'Subscriptions', 10.99, 'USD', 'bank', 'Spotify'],
  [4, 8, 'Food', 2, 'USD', 'cash', null],
  [4, 15, 'Health', 8, 'USD', 'cash', 'Pharmacy'],
  [5, 12, 'Food', 9500, 'KRW', 'bank', 'Kimbap'],
  [6, 11, 'Bills', 18, 'USD', 'bank', 'Phone top-up'],
  [7, 21, 'Entertainment', 1500, 'JPY', 'bank', 'Steam game'],
  [8, 13, 'Food', 4.25, 'USD', 'cash', 'Lunch with friends'],
  [9, 17, 'Gas', 20000, 'KHR', 'cash', null],
  [10, 9, 'Shopping', 45, 'CNY', 'bank', 'Phone case'],
  [12, 19, 'Food', 14, 'USD', 'bank', 'Pizza'],
  [14, 10, 'Bills', 32.5, 'USD', 'bank', 'Electricity'],
  [16, 14, 'Travel', 12, 'USD', 'bank', 'Bus to Siem Reap'],
  [17, 12, 'Food', 1200, 'JPY', 'cash', 'Ramen'],
  [19, 16, 'Health', 25, 'USD', 'bank', 'Dentist check-up'],
  [21, 20, 'Entertainment', 9, 'USD', 'cash', 'Karaoke'],
  [24, 11, 'Subscriptions', 15.49, 'USD', 'bank', 'Netflix'],
  [27, 13, 'Food', 32000, 'KHR', 'cash', 'Family lunch'],
  [30, 9, 'Shopping', 39000, 'KRW', 'bank', 'Skincare'],
  [33, 18, 'Gas', 6, 'USD', 'cash', null],
  [36, 12, 'Travel', 85, 'USD', 'bank', 'Flight to Bangkok'],
  [38, 20, 'Food', 68, 'CNY', 'cash', 'Hotpot'],
  [41, 15, 'Bills', 20, 'USD', 'bank', 'Internet'],
  [45, 10, 'Health', 40000, 'KHR', 'cash', 'Vitamins'],
  [48, 19, 'Entertainment', 3000, 'JPY', 'bank', 'Concert merch'],
  [52, 13, 'Food', 5.75, 'USD', 'cash', null],
  [55, 11, 'Shopping', 19.9, 'USD', 'bank', 'T-shirt'],
  [58, 16, 'Other', 10, 'USD', 'cash', 'Birthday gift'],
];

function sampleData() {
  const categories = SAMPLE_CATEGORIES.map((c, i) => ({ id: i + 1, ...c }));
  const expenses = SAMPLE_EXPENSES.map(([daysAgo, hour, categoryName, amount, currency, paymentMethod, note], i) => {
    const day = subDays(startOfToday(), daysAgo);
    const createdAt = setHours(day, hour).toISOString();
    const rateToUsd = RATES_TO_USD[currency];
    return {
      id: i + 1,
      amount,
      currency,
      rateToUsd,
      amountUsd: convertToUsd(amount, rateToUsd),
      categoryId: categories.find((c) => c.name === categoryName).id,
      paymentMethod,
      note,
      spentAt: format(day, 'yyyy-MM-dd'),
      createdAt,
      updatedAt: createdAt,
    };
  });
  // Ids are never reused, so a link to a deleted expense can't open another one.
  return { categories, expenses, nextCategoryId: categories.length + 1, nextExpenseId: expenses.length + 1 };
}

//////////////////////////////
// Load and save
//////////////////////////////

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.categories) && Array.isArray(saved?.expenses)) return saved;
  } catch {
    // Blocked storage or broken JSON: start from the sample data.
  }
  return sampleData();
}

/** { categories, expenses, nextCategoryId, nextExpenseId }. Change it, then call save(). */
export const db = load();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage full or blocked: keep working, just without remembering.
  }
}

export function resetSampleData() {
  Object.assign(db, sampleData());
  save();
}

//////////////////////////////
// Helpers
//////////////////////////////

export function findCategory(id) {
  return db.categories.find((c) => c.id === Number(id));
}

/** An error that carries one message per form field, e.g. { name: 'Enter a name' }. */
export function formError(fieldErrors) {
  const error = new Error('Please fix the highlighted fields');
  error.fieldErrors = fieldErrors;
  return error;
}
