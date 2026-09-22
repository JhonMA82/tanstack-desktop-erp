/**
 * Formats an amount as USD-style currency (e.g. `$42,128.00`).
 *
 * @param amount - The amount to format.
 * @param currency - ISO 4217 currency code (defaults to `USD`).
 * @returns The localized currency string with two decimal places.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a ratio as a signed percentage with one decimal (e.g. `+12.4%`, `-3.1%`).
 *
 * @param ratio - The ratio to format (`0.124` becomes `+12.4%`).
 * @returns The signed percentage string.
 */
export function formatPercent(ratio: number): string {
  const sign = ratio >= 0 ? "+" : "";
  return `${sign}${(ratio * 100).toFixed(1)}%`;
}
