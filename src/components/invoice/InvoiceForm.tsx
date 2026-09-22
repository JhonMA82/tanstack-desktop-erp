import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { type TabDef, Tabs } from "@/components/ui/Tabs";
import type { InvoiceParty, InvoiceTaxOption } from "@/lib/invoice";
import { ClientSelector } from "./ClientSelector";
import { useInvoiceEditor } from "./editor-context";
import { InvoiceAdjustments } from "./InvoiceAdjustments";
import { InvoiceDetails } from "./InvoiceDetails";
import { InvoiceItems } from "./InvoiceItems";
import { SectionHeading } from "./SectionHeading";

const TABS: TabDef[] = [
  { id: "invoice", label: "Invoice" },
  { id: "payment", label: "Payment" },
  { id: "business", label: "Business" },
];

export interface InvoiceFormProps {
  clients: InvoiceParty[];
  taxOptions: InvoiceTaxOption[];
}

/**
 * Left column of the composer: tab strip plus the editable sections. The
 * Invoice tab mirrors the reference example; Payment and Business surface the
 * read-only halves of the same draft instead of dead tabs.
 */
export function InvoiceForm({ clients, taxOptions }: InvoiceFormProps) {
  const [tab, setTab] = useState("invoice");

  return (
    <Panel title="Composer" actions={<StatusBadge status="DRAFT" />}>
      <Tabs tabs={TABS} active={tab} onActiveChange={setTab} />
      {tab === "invoice" ? (
        <div className="flex flex-col gap-3 p-2">
          <InvoiceDetails />
          <Rule />
          <ClientSelector clients={clients} />
          <Rule />
          <InvoiceItems />
          <Rule />
          <InvoiceAdjustments taxOptions={taxOptions} />
        </div>
      ) : tab === "payment" ? (
        <PaymentTab />
      ) : (
        <BusinessTab />
      )}
    </Panel>
  );
}

/** Read-only payment summary of the issuing account. */
function PaymentTab() {
  const { values } = useInvoiceEditor();

  return (
    <div className="flex flex-col gap-3 p-2">
      <SectionHeading>Payment</SectionHeading>
      <dl className="grid grid-cols-1 gap-x-3 gap-y-1 font-mono text-[11px] sm:grid-cols-2">
        <Readout label="Account" value={values.issuer.paymentAccountName} />
        <Readout label="Routing No." value={values.issuer.routingNumber} />
        <Readout label="Due Date" value={values.paymentDueDate} />
        <Readout label="Pay To" value={values.issuer.name} />
      </dl>
      <p className="font-mono text-[10px] leading-relaxed text-ink-dim">
        Bank details come from the issuing profile. Wire transfers reference{" "}
        <span className="text-orange">{values.referenceNumber || "—"}</span>.
      </p>
    </div>
  );
}

/** Read-only profile of the issuing company. */
function BusinessTab() {
  const { values } = useInvoiceEditor();
  const issuer = values.issuer;

  return (
    <div className="flex flex-col gap-3 p-2">
      <SectionHeading>Business</SectionHeading>
      <dl className="grid grid-cols-1 gap-x-3 gap-y-1 font-mono text-[11px] sm:grid-cols-2">
        <Readout label="Legal Name" value={issuer.name} />
        <Readout label="Tax ID" value={issuer.taxId} />
        <Readout label="Email" value={issuer.email} />
        <Readout label="Phone" value={issuer.phone} />
        <Readout label="Website" value={issuer.website} />
        <Readout label="Issued By" value={issuer.issuerName} />
      </dl>
      <p className="font-mono text-[10px] leading-relaxed text-ink-dim">
        {issuer.addressLines.join(" · ")}
      </p>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-1">
      <dt className="text-ink-dim uppercase">{label}</dt>
      <dd className="truncate text-right text-ink">{value}</dd>
    </div>
  );
}

/** Hairline separator between form sections (the reference `Separator`). */
function Rule() {
  return <div className="h-px w-full bg-border" aria-hidden="true" />;
}
