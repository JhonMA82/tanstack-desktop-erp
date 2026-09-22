/**
 * Pure invoice domain logic: value types, local-date helpers and the document
 * math behind the `/invoice` example (ported from the reference dashboard's
 * `data.ts`). No React and no fixtures live here — the composer, the paper and
 * the tests all consume this module, while seed data stays in `src/data`.
 */

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

/** Counterparty of the invoice (the "Bill to" party). */
export interface InvoiceParty {
  id: string;
  name: string;
  email: string;
  addressLines: string[];
  taxId: string;
}

/** Issuing company details shown in the "From" block and the paper footer. */
export interface InvoiceIssuer {
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLines: string[];
  taxId: string;
  paymentAccountName: string;
  routingNumber: string;
  issuerName: string;
}

export interface InvoiceTaxOption {
  id: string;
  name: string;
  /** Percentage applied to the discounted base (e.g. `18` for 18%). */
  rate: number;
}

export type InvoiceDiscountType = "fixed" | "percent";

/** Editable draft values of the invoice composer. */
export interface InvoiceValues {
  referenceNumber: string;
  /** Local `yyyy-MM-dd` string bound to the issued-date input. */
  issuedDate: string;
  /** Local `yyyy-MM-dd` string bound to the due-date input. */
  paymentDueDate: string;
  issuer: InvoiceIssuer;
  to: InvoiceParty;
  taxId: string;
  discountType: InvoiceDiscountType;
  discountValue: number;
  items: InvoiceLineItem[];
}

/** Money breakdown rendered by the paper and the preview header. */
export interface InvoiceTotals {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Formats a date as a local `yyyy-MM-dd` string (an `input[type=date]` value)
 * without going through `toISOString`, which would shift across timezones.
 *
 * @param date - The date to format.
 * @returns The local calendar date as `yyyy-MM-dd`.
 */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Shifts a date by a whole number of calendar days.
 *
 * @param date - The base date (not mutated).
 * @param days - Number of days to add (negative shifts backwards).
 * @returns A new date shifted by `days`.
 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Parses a numeric input value, mapping an empty box to `NaN` so the input can
 * round-trip (`NaN` renders as an empty string) while the math treats it as0.
 *
 * @param raw - The raw input string.
 * @returns The parsed number, or `NaN` when the box is empty or invalid.
 */
export function parseNumericInput(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return Number.NaN;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/**
 * Net amount of a single line item.
 *
 * @param item - The line to total; missing or partial values count as 0.
 * @returns `quantity × unitPrice`.
 */
export function getLineAmount(item?: InvoiceLineItem): number {
  if (!item) {
    return 0;
  }
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
  const unitPrice = Number.isFinite(item.unitPrice) ? item.unitPrice : 0;
  return quantity * unitPrice;
}

/**
 * Sums every line net amount.
 *
 * @param values - Draft holding the line items.
 * @returns The invoice subtotal before discount and tax.
 */
export function getSubtotal(values: Pick<InvoiceValues, "items">): number {
  return values.items.reduce((subtotal, item) => subtotal + getLineAmount(item), 0);
}

/**
 * Resolves the selected tax option, falling back to the first entry and, when
 * the list is empty, to a neutral 0% option.
 *
 * @param values - Draft holding the selected `taxId`.
 * @param options - Available tax options.
 * @returns The resolved tax option.
 */
export function getTaxOption(
  values: Pick<InvoiceValues, "taxId">,
  options: InvoiceTaxOption[],
): InvoiceTaxOption {
  return (
    options.find((option) => option.id === values.taxId) ??
    options[0] ?? { id: "none", name: "No Tax", rate: 0 }
  );
}

/**
 * Computes the discount clamped to `[0, subtotal]`; percent discounts apply
 * to the subtotal, fixed discounts are absolute amounts.
 *
 * @param values - Draft holding `discountType` and `discountValue`.
 * @param subtotal - Pre-computed subtotal (avoids re-summing the lines).
 * @returns The clamped discount amount.
 */
export function getDiscount(
  values: Pick<InvoiceValues, "discountType" | "discountValue">,
  subtotal: number,
): number {
  const value = Number.isFinite(values.discountValue) ? values.discountValue : 0;
  const discount = values.discountType === "percent" ? subtotal * (value / 100) : value;
  return Math.min(Math.max(discount, 0), subtotal);
}

/**
 * Breaks the draft down into money totals. Tax applies to the discounted base
 * and the base itself never goes negative.
 *
 * @param values - The draft to total.
 * @param options - Available tax options (used to resolve `values.taxId`).
 * @returns Subtotal, discount, tax and balance due.
 */
export function getTotals(values: InvoiceValues, options: InvoiceTaxOption[]): InvoiceTotals {
  const subtotal = getSubtotal(values);
  const discount = getDiscount(values, subtotal);
  const base = Math.max(subtotal - discount, 0);
  const tax = base * (getTaxOption(values, options).rate / 100);
  return { subtotal, discount, tax, total: base + tax };
}
