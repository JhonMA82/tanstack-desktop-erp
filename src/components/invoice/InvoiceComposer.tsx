import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { InvoiceSeed } from "@/data/invoice";
import { formatCurrency } from "@/lib/format";
import { getTotals, type InvoiceValues } from "@/lib/invoice";
import { InvoiceEditorProvider } from "./editor-context";
import { InvoiceForm } from "./InvoiceForm";
import { InvoicePreview } from "./InvoicePreview";

export interface InvoiceComposerProps {
  /** Seed payload loaded by `invoiceQueryOptions`. */
  seed: InvoiceSeed;
}

/**
 * Full invoice example: intro bar with the document actions, the editable
 * form on the left and the printable paper preview on the right.
 */
export function InvoiceComposer({ seed }: InvoiceComposerProps) {
  const { push } = useToast();
  const [values, setValues] = useState<InvoiceValues>(seed.defaults);

  const patch = (partial: Partial<InvoiceValues>) =>
    setValues((current) => ({ ...current, ...partial }));

  const totals = getTotals(values, seed.taxOptions);
  const lineCount = values.items.length;

  return (
    <InvoiceEditorProvider editor={{ values, patch }}>
      <div className="flex flex-col gap-2">
        <Panel title="Invoice • New Document" actions={<Badge tone="orange">DRAFT</Badge>}>
          <div className="flex flex-col gap-3 p-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-[15px] font-semibold leading-none tracking-tight text-ink-bright">
                Create New Invoice
              </h1>
              <p className="max-w-[60ch] text-[11px] text-ink-dim">
                Add invoice details, review the preview, and send it to your client.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={() =>
                  push({
                    kind: "INFO",
                    title: "DRAFT SAVED",
                    message: `${values.referenceNumber || "NO REF"} — ${lineCount} line(s) — ${formatCurrency(totals.total)}`,
                  })
                }
              >
                Save as Draft
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  push({
                    kind: "SUCCESS",
                    title: "INVOICE SENT",
                    message: `${values.referenceNumber || "NO REF"} → ${values.to.email} — ${formatCurrency(totals.total)}`,
                  })
                }
              >
                Send Invoice
              </Button>
            </div>
          </div>
        </Panel>

        <form
          className="grid grid-cols-1 items-start gap-2 xl:grid-cols-2"
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <InvoiceForm clients={seed.clients} taxOptions={seed.taxOptions} />
          <InvoicePreview taxOptions={seed.taxOptions} />
        </form>
      </div>
    </InvoiceEditorProvider>
  );
}
