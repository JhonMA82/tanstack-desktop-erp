import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InvoiceComposer } from "@/components/invoice/InvoiceComposer";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { invoiceQueryOptions } from "@/data/invoice";

export const Route = createFileRoute("/invoice")({
  component: InvoicePage,
});

/** Invoice example: loads the seed, then composes the editable preview. */
function InvoicePage() {
  const { data, isPending, isError, error, refetch } = useQuery(invoiceQueryOptions);

  if (isPending) {
    return <InvoiceStatus title="LOADING INVOICE…" />;
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="p-2">
        <Panel title="INVOICE • ERROR">
          <div className="flex items-center gap-3 p-4">
            <span className="font-mono text-[11px] text-red">{message}</span>
            <Button onClick={() => void refetch()}>RETRY</Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <InvoiceComposer seed={data} />
    </div>
  );
}

function InvoiceStatus({ title }: { title: string }) {
  return (
    <div className="p-2">
      <Panel title="INVOICE">
        <p className="p-4 font-mono text-[11px] text-ink-dim">{title}</p>
      </Panel>
    </div>
  );
}
