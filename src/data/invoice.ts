import { queryOptions } from "@tanstack/react-query";
import {
  addDays,
  type InvoiceIssuer,
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
 * Simulated API latency so loading states are observable during development.
 * Replace the body with a real `fetch` when wiring a backend; the returned
 * `invoiceQueryOptions` contract stays the same.
 */
const SIMULATED_LATENCY_MS = 250;

/** Loads the invoice seed (defaults, clients and tax options). */
export async function fetchInvoice(): Promise<InvoiceSeed> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  return {
    defaults: createDefaults(),
    clients: INVOICE_CLIENTS,
    taxOptions: INVOICE_TAX_OPTIONS,
  };
}

/** TanStack Query options for the invoice seed (key: `["invoice"]`). */
export const invoiceQueryOptions = queryOptions({
  queryKey: ["invoice"],
  queryFn: fetchInvoice,
});
