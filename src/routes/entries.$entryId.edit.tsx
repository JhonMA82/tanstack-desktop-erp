import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { EntryForm } from "@/components/entries/EntryForm";
import { useUpdateEntry } from "@/components/entries/use-entry-mutations";
import type { EntryInput } from "@/data/entries";
import { entryQueryOptions } from "@/data/entries";

export const Route = createFileRoute("/entries/$entryId/edit")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(entryQueryOptions(params.entryId)),
  component: EditEntryPage,
});

function EditEntryPage() {
  const { entryId } = Route.useParams();
  const { data: entry } = useSuspenseQuery(entryQueryOptions(entryId));
  const navigate = useNavigate();
  const update = useUpdateEntry((row) => {
    void navigate({ to: "/entries/$entryId", params: { entryId: row.id } });
  });

  if (entry.status === "ARCHIVED") {
    return (
      <div className="p-2">
        <p className="font-mono text-[11px] text-ink-dim">
          {entry.id} is archived and cannot be edited.{" "}
          <Link to="/entries/$entryId" params={{ entryId: entry.id }} className="text-orange">
            BACK TO DETAIL
          </Link>
        </p>
      </div>
    );
  }

  // Archived rows never reach the form (the input contract has no ARCHIVED status).
  const defaults: EntryInput = {
    date: entry.date,
    description: entry.description,
    account: entry.account,
    amountCents: entry.amountCents,
    status: entry.status,
  };

  return (
    <div className="p-2">
      <EntryForm
        defaultValues={defaults}
        submitLabel="SAVE CHANGES"
        isPending={update.isPending}
        onSubmit={(input) => update.mutateAsync({ id: entry.id, input }).catch(() => undefined)}
        onCancel={() => void navigate({ to: "/entries/$entryId", params: { entryId: entry.id } })}
      />
    </div>
  );
}
