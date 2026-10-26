import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { getJson, MOCK_LATENCY_MS, simulateLatency } from "@/lib/api";
import { DATA_SOURCE } from "@/lib/env";
import {
  addDays,
  type InvoiceIssuer,
  type InvoiceLineItem,
  type InvoiceParty,
  type InvoiceTaxOption,
  type InvoiceValues,
  toIsoDate,
} from "@/lib/invoice";

/** Tax options offered by the adjustments section (rates are percentages). */
export const INVOICE_TAX_OPTIONS: InvoiceTaxOption[] = [
  { id: "gst", name: "GST", rate: 18 },
  { id: "vat", name: "VAT", rate: 12 },
  { id: "service-tax", name: "Service Tax", rate: 10 },
  { id: "none", name: "No Tax", rate: 0 },
];

/** Issuing company behind every draft of the example. */
export const INVOICE_ISSUER: InvoiceIssuer = {
  name: "Weblabs Studio",
  email: "hello@weblabs.studio",
  phone: "+1-512-555-0184",
  website: "weblabs.studio",
  addressLines: ["214 Pixel Avenue", "Austin, TX 78701"],
  taxId: "WS-1029384756",
  paymentAccountName: "Mercury Business",
  routingNumber: "084009519",
  issuerName: "Arham Khan",
};

/** Clients selectable in the "Billed To" section. */
export const INVOICE_CLIENTS: InvoiceParty[] = [
  {
    id: "bright-enterprises",
    name: "Bright Enterprises",
    email: "billing@brightenterprises.com",
    addressLines: ["450 Park Avenue South", "New York, NY 10016", "United States"],
    taxId: "US-EIN-84-2938475",
  },
  {
    id: "aiy-cap",
    name: "AIY Cap",
    email: "finance@aiycap.com",
    addressLines: ["One BKC, Bandra Kurla Complex", "Mumbai, Maharashtra 400051"],
    taxId: "GSTIN-27AAICA9102K1Z7",
  },
  {
    id: "northline-gmbh",
    name: "Northline GmbH",
    email: "ap@northline.de",
    addressLines: ["Kastanienallee 32", "10435 Berlin", "Germany"],
    taxId: "DE-VAT-219384756",
  },
];

/** Payload consumed by the composer: defaults plus the reference lists. */
export interface InvoiceSeed {
  /** Initial draft values (dates are computed from "today"). */
  defaults: InvoiceValues;
  clients: InvoiceParty[];
  taxOptions: InvoiceTaxOption[];
}

const lineItemSchema: z.ZodType<InvoiceLineItem> = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

const partySchema: z.ZodType<InvoiceParty> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  addressLines: z.array(z.string()),
  taxId: z.string(),
});

const issuerSchema: z.ZodType<InvoiceIssuer> = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  website: z.string(),
  addressLines: z.array(z.string()),
  taxId: z.string(),
  paymentAccountName: z.string(),
  routingNumber: z.string(),
  issuerName: z.string(),
});

const taxOptionSchema: z.ZodType<InvoiceTaxOption> = z.object({
  id: z.string(),
  name: z.string(),
  rate: z.number(),
});

const valuesSchema: z.ZodType<InvoiceValues> = z.object({
  referenceNumber: z.string(),
  issuedDate: z.string(),
  paymentDueDate: z.string(),
  issuer: issuerSchema,
  to: partySchema,
  taxId: z.string(),
  discountType: z.enum(["fixed", "percent"]),
  discountValue: z.number(),
  items: z.array(lineItemSchema),
});

/** Wire contract of `/invoice`; the mock seed is validated with it too. */
const invoiceSeedSchema: z.ZodType<InvoiceSeed> = z.object({
  defaults: valuesSchema,
  clients: z.array(partySchema),
  taxOptions: z.array(taxOptionSchema),
});

function createDefaults(): InvoiceValues {
  const today = new Date();
  return {
    referenceNumber: "FL-0425",
    issuedDate: toIsoDate(today),
    paymentDueDate: toIsoDate(addDays(today, 14)),
    issuer: INVOICE_ISSUER,
    to: INVOICE_CLIENTS[1],
    taxId: "vat",
    discountType: "fixed",
    discountValue: 40,
    items: [
      { id: "hosting", description: "Cloud hosting services", quantity: 1, unitPrice: 3500 },
      { id: "analytics", description: "Data analytics report", quantity: 2, unitPrice: 750 },
      { id: "support", description: "Technical support retainer", quantity: 1, unitPrice: 400 },
    ],
  };
}

/**
 * Loads the invoice seed (defaults, clients and tax options) from the configured
 * data origin: the local seed behind simulated latency, or `GET /invoice`
 * validated against the contract.
 */
export async function fetchInvoice(): Promise<InvoiceSeed> {
  if (DATA_SOURCE === "http") {
    return getJson("/invoice", invoiceSeedSchema);
  }

  await simulateLatency(MOCK_LATENCY_MS);
  return invoiceSeedSchema.parse({
    defaults: createDefaults(),
    clients: INVOICE_CLIENTS,
    taxOptions: INVOICE_TAX_OPTIONS,
  });
}

/** TanStack Query options for the invoice seed (key: `["invoice"]`). */
export const invoiceQueryOptions = queryOptions({
  queryKey: ["invoice"],
  queryFn: fetchInvoice,
});
