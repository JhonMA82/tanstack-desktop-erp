import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EntryForm, emptyEntry } from "@/components/entries/EntryForm";
import { useCreateEntry } from "@/components/entries/use-entry-mutations";

export const Route = createFileRoute("/entries/new")({
  component: NewEntryPage,
});

function NewEntryPage() {
  const navigate = useNavigate();
  const create = useCreateEntry((entry) => {
    void navigate({ to: "/entries/$entryId", params: { entryId: entry.id } });
  });

  return (
    <div className="p-2">
      <EntryForm
        defaultValues={emptyEntry()}
        submitLabel="CREATE ENTRY"
        isPending={create.isPending}
        // The hook already toasts the failure; the form stays open for a retry.
        onSubmit={(input) => create.mutateAsync(input).catch(() => undefined)}
        onCancel={() => void navigate({ to: "/entries" })}
      />
    </div>
  );
}
