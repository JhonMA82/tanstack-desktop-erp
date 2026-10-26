import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InvoiceComposer } from "@/components/invoice/InvoiceComposer";
import { invoiceQueryOptions } from "@/data/invoice";

export const Route = createFileRoute("/invoice")({
  // Awaited before the route renders, so the composer always mounts with a seed.
  loader: ({ context }) => context.queryClient.ensureQueryData(invoiceQueryOptions),
  component: InvoicePage,
});

/** Invoice example: loads the seed, then composes the editable preview. */
function InvoicePage() {
  const { data } = useSuspenseQuery(invoiceQueryOptions);

  return (
    <div className="flex flex-col gap-2 p-2">
      <InvoiceComposer seed={data} />
    </div>
  );
}
