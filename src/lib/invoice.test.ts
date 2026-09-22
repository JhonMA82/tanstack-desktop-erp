import { describe, expect, test } from "bun:test";
import type { InvoiceLineItem, InvoiceTaxOption, InvoiceValues } from "./invoice";
import {
  addDays,
  getDiscount,
  getLineAmount,
  getSubtotal,
  getTaxOption,
  getTotals,
  parseNumericInput,
  toIsoDate,
} from "./invoice";

const TAX_OPTIONS: InvoiceTaxOption[] = [
  { id: "gst", name: "GST", rate: 18 },
  { id: "vat", name: "VAT", rate: 12 },
  { id: "none", name: "No Tax", rate: 0 },
];

const LINE: InvoiceLineItem = {
  id: "hosting",
  description: "Cloud hosting",
  quantity: 2,
  unitPrice: 750,
};

function draft(overrides: Partial<InvoiceValues> = {}): InvoiceValues {
  return {
    referenceNumber: "FL-0425",
    issuedDate: "2026-09-22",
    paymentDueDate: "2026-10-06",
    issuer: {
      name: "Weblabs Studio",
      email: "hello@weblabs.studio",
      phone: "+1-512-555-0184",
      website: "weblabs.studio",
      addressLines: ["214 Pixel Avenue", "Austin, TX 78701"],
      taxId: "WS-1029384756",
      paymentAccountName: "Mercury Business",
      routingNumber: "084009519",
      issuerName: "Arham Khan",
    },
    to: {
      id: "aiy-cap",
      name: "AIY Cap",
      email: "finance@aiycap.com",
      addressLines: ["One BKC", "Mumbai, Maharashtra 400051"],
      taxId: "GSTIN-27AAICA9102K1Z7",
    },
    taxId: "vat",
    discountType: "fixed",
    discountValue: 0,
    items: [LINE],
    ...overrides,
  };
}

describe("toIsoDate / addDays", () => {
  test("formats a local calendar date", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toIsoDate(new Date(2026, 10, 23))).toBe("2026-11-23");
  });

  test("shifts days without mutating the base date", () => {
    const base = new Date(2026, 8, 22);
    expect(toIsoDate(addDays(base, 14))).toBe("2026-10-06");
    expect(toIsoDate(addDays(base, -1))).toBe("2026-09-21");
    expect(toIsoDate(base)).toBe("2026-09-22");
  });

  test("rolls over month boundaries", () => {
    expect(toIsoDate(addDays(new Date(2026, 8, 30), 5))).toBe("2026-10-05");
  });
});

describe("parseNumericInput", () => {
  test("parses plain and decimal values", () => {
    expect(parseNumericInput("3")).toBe(3);
    expect(parseNumericInput("750.5")).toBe(750.5);
    expect(parseNumericInput(" 42 ")).toBe(42);
  });

  test("maps empty or invalid boxes to NaN", () => {
    expect(parseNumericInput("")).toBeNaN();
    expect(parseNumericInput("   ")).toBeNaN();
    expect(parseNumericInput("abc")).toBeNaN();
  });
});

describe("getLineAmount", () => {
  test("multiplies quantity by unit price", () => {
    expect(getLineAmount(LINE)).toBe(1500);
  });

  test("treats missing lines and partial values as zero", () => {
    expect(getLineAmount(undefined)).toBe(0);
    expect(getLineAmount({ ...LINE, quantity: Number.NaN })).toBe(0);
    expect(getLineAmount({ ...LINE, unitPrice: Number.NaN })).toBe(0);
  });
});

describe("getSubtotal", () => {
  test("sums every line", () => {
    expect(
      getSubtotal({ items: [LINE, { ...LINE, id: "support", quantity: 1, unitPrice: 400 }] }),
    ).toBe(1900);
  });

  test("returns 0 for an empty invoice", () => {
    expect(getSubtotal({ items: [] })).toBe(0);
  });
});

describe("getDiscount", () => {
  test("applies a fixed amount", () => {
    expect(getDiscount({ discountType: "fixed", discountValue: 40 }, 2000)).toBe(40);
  });

  test("applies a percentage of the subtotal", () => {
    expect(getDiscount({ discountType: "percent", discountValue: 10 }, 2000)).toBe(200);
  });

  test("clamps to the subtotal and ignores invalid values", () => {
    expect(getDiscount({ discountType: "fixed", discountValue: 9999 }, 2000)).toBe(2000);
    expect(getDiscount({ discountType: "fixed", discountValue: -50 }, 2000)).toBe(0);
    expect(getDiscount({ discountType: "percent", discountValue: Number.NaN }, 2000)).toBe(0);
  });
});

describe("getTaxOption", () => {
  test("resolves the selected id", () => {
    expect(getTaxOption({ taxId: "gst" }, TAX_OPTIONS).rate).toBe(18);
  });

  test("falls back to the first option and then to 0%", () => {
    expect(getTaxOption({ taxId: "missing" }, TAX_OPTIONS).id).toBe("gst");
    expect(getTaxOption({ taxId: "missing" }, []).rate).toBe(0);
  });
});

describe("getTotals", () => {
  test("taxes the discounted base", () => {
    const values = draft({ discountType: "fixed", discountValue: 40, taxId: "vat" });
    // Subtotal 1500 − 40 = 1460 base; VAT 12% → 175.2 tax; total 1635.2.
    expect(getTotals(values, TAX_OPTIONS)).toEqual({
      subtotal: 1500,
      discount: 40,
      tax: 175.2,
      total: 1635.2,
    });
  });

  test("never taxes or totals below zero", () => {
    const values = draft({ discountType: "fixed", discountValue: 5000, taxId: "gst" });
    const totals = getTotals(values, TAX_OPTIONS);
    expect(totals.discount).toBe(1500);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(0);
  });

  test("zero-rates the invoice with the No Tax option", () => {
    const totals = getTotals(draft({ taxId: "none" }), TAX_OPTIONS);
    expect(totals.tax).toBe(0);
    expect(totals.total).toBe(1500);
  });
});
