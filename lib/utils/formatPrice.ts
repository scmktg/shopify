/**
 * AUD price formatter shared across editorial content, the install
 * package page, and the homepage hero card. Single source of truth
 * for the on-page rendering format — whole dollars render without
 * trailing `.00`, prices with cents keep the cents.
 *
 *   formatAud(2299)    → '$2,299'
 *   formatAud(1199.95) → '$1,199.95'
 */
const AUD = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const AUD_FIXED = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatAud(amount: number): string {
  return AUD.format(amount);
}

/**
 * Always shows two decimal places. Use inside arithmetic dl blocks
 * (e.g. `$1,199.95 + $1,099.05 = $2,299.00`) where mixing
 * whole-dollar and cents formats breaks the visual reconciliation.
 */
export function formatAudFixed(amount: number): string {
  return AUD_FIXED.format(amount);
}
