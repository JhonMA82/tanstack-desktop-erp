import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EntriesTable } from "@/components/entries/EntriesTable";
import { entriesQueryOptions } from "@/data/entries";

export const Route = createFileRoute("/entries/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(entriesQueryOptions),
  component: EntriesPage,
});

function EntriesPage() {
  const { data } = useSuspenseQuery(entriesQueryOptions);

  return (
    <div className="p-2">
      <EntriesTable entries={data.entries} total={data.totalLabel} />
    </div>
  );
}
