import { formatCurrency } from "@/lib/format";
import {
  getLineAmount,
  getTaxOption,
  getTotals,
  type InvoiceTaxOption,
  type InvoiceValues,
} from "@/lib/invoice";

/** Paper geometry in CSS pixels (US Letter at 96dpi), shared with the preview. */
export const INVOICE_PAPER_WIDTH = 816;
export const INVOICE_PAPER_HEIGHT = 1056;

export interface InvoicePaperProps {
  values: InvoiceValues;
  taxOptions: InvoiceTaxOption[];
}

/**
 * The invoice document itself: a light, print-first sheet rendered both inside
 * the dark preview canvas and (through a portal) as the sole print target.
 * Colors are explicit document neutrals rather than theme tokens on purpose.
 */
export function InvoicePaper({ values, taxOptions }: InvoicePaperProps) {
  const totals = getTotals(values, taxOptions);
  const taxOption = getTaxOption(values, taxOptions);
  const discountLabel =
    values.discountType === "percent"
      ? `Discount ${Number.isFinite(values.discountValue) ? values.discountValue : 0}%`
      : "Discount";

  return (
    <article
      style={{ width: INVOICE_PAPER_WIDTH, height: INVOICE_PAPER_HEIGHT }}
      className="relative flex flex-col justify-between bg-white px-12 py-11 font-mono text-[13px] leading-relaxed text-neutral-950"
    >
      <header className="flex flex-col gap-10">
        <div className="grid grid-cols-2 items-start gap-14">
          <svg className="size-12 text-orange" viewBox="0 0 48 48" aria-hidden="true">
            <rect width="20" height="20" rx="3" fill="currentColor" />
            <rect x="28" width="20" height="20" rx="3" fill="currentColor" />
            <rect y="28" width="20" height="20" rx="3" fill="currentColor" />
            <rect x="28" y="28" width="20" height="20" rx="3" fill="currentColor" />
          </svg>
          <h2 className="text-right text-4xl font-bold uppercase tracking-widest">Invoice</h2>
        </div>

        <section className="grid grid-cols-2 gap-14">
          <div className="flex flex-col">
            <span>Reference: {values.referenceNumber || "—"}</span>
            <span>Issued: {values.issuedDate}</span>
            <span>Payment due: {values.paymentDueDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold uppercase">Payment Account</span>
            <span>{values.issuer.paymentAccountName}</span>
            <span>Routing no. {values.issuer.routingNumber}</span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-14">
          <div className="flex flex-col">
            <span className="mb-3 font-semibold uppercase">From</span>
            <span>{values.issuer.name}</span>
            {values.issuer.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span>Tax ID: {values.issuer.taxId}</span>
          </div>
          <div className="flex flex-col">
            <span className="mb-3 font-semibold uppercase">Bill To</span>
            <span>{values.to.name}</span>
            {values.to.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span>Tax ID: {values.to.taxId}</span>
          </div>
        </section>
      </header>

      <div className="flex flex-col gap-5">
        <section>
          <div className="grid grid-cols-[1fr_72px_112px_116px] bg-neutral-100 px-3 py-2.5 font-semibold uppercase">
            <span>Description</span>
            <span className="text-right">Units</span>
            <span className="text-right">Unit Cost</span>
            <span className="text-right">Line Total</span>
          </div>
          {values.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_72px_112px_116px] border-b border-neutral-200 px-3 py-3"
            >
              <span className="truncate pr-3">{item.description || "—"}</span>
              <span className="text-right">
                {Number.isFinite(item.quantity) ? item.quantity : 0}
              </span>
              <span className="text-right">{formatCurrency(item.unitPrice || 0)}</span>
              <span className="text-right">{formatCurrency(getLineAmount(item))}</span>
            </div>
          ))}
        </section>

        <section className="ml-auto w-[380px] flex flex-col gap-2 text-[13px]">
          <div className="flex justify-between gap-8">
            <span>Net amount</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>{discountLabel}</span>
            <span>{formatCurrency(totals.discount)}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span>
              {taxOption.name} {taxOption.rate}%
            </span>
            <span>{formatCurrency(totals.tax)}</span>
          </div>
          <div className="flex justify-between gap-8 border-y-2 border-neutral-900 py-2.5 font-bold uppercase">
            <span>Balance Due</span>
            <span>{formatCurrency(totals.total)}</span>
          </div>
        </section>
      </div>

      <footer className="absolute right-12 bottom-11 left-12 grid grid-cols-2 gap-14 text-[12px] text-neutral-500">
        <div className="flex flex-col">
          <span>{values.issuer.email}</span>
          <span>{values.issuer.phone}</span>
          <span>{values.issuer.website}</span>
        </div>
        <div className="flex flex-col">
          <span>Prepared for prompt processing.</span>
          <span>Issued by {values.issuer.issuerName}</span>
        </div>
      </footer>
    </article>
  );
}
