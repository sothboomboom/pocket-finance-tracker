// Used by the amount field while typing and when the currency changes.

/** Keeps only digits and one decimal point, with at most `decimals` decimals. */
export function cleanAmountInput(raw, decimals = 2) {
  let text = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const [whole, ...rest] = text.split('.');
  const fraction = rest.join('');
  if (decimals === 0) return whole.slice(0, 12);
  text = rest.length > 0 ? `${whole.slice(0, 12)}.${fraction.slice(0, decimals)}` : whole.slice(0, 12);
  return text;
}
