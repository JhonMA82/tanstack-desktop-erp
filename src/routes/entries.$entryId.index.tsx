import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useArchiveEntry } from "@/components/entries/use-entry-mutations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EntryStatus } from "@/data/entries";
import { entryQueryOptions } from "@/data/entries";
import { formatCents } from "@/lib/format";

const STATUS_TONE: Record<EntryStatus, StatusTone> = {
  DRAFT: "warning",
  POSTED: "positive",
  ARCHIVED: "neutral",
};

/** Detail page: reached from a table row, reads the entry by its route param. */
export const Route = createFileRoute("/entries/$entryId/")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(entryQueryOptions(params.entryId)),
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const { entryId } = Route.useParams();
  const { data: entry } = useSuspenseQuery(entryQueryOptions(entryId));
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const archive = useArchiveEntry(() => {
    void navigate({ to: "/entries" });
  });

  const archived = entry.status === "ARCHIVED";

  return (
    <div className="flex flex-col gap-2 p-2">
      <Panel
        title={`ENTRY • ${entry.id}`}
        actions={
          <span className="flex items-center gap-2">
            <StatusBadge tone={STATUS_TONE[entry.status]}>{entry.status}</StatusBadge>
            {archived ? null : (
              <Button
                size="sm"
                onClick={() =>
                  void navigate({
                    to: "/entries/$entryId/edit",
                    params: { entryId: entry.id },
                  })
                }
              >
                EDIT
              </Button>
            )}
            {archived ? null : (
              <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
                ARCHIVE
              </Button>
            )}
          </span>
        }
      >
        <dl className="flex flex-col">
          <PropertyRow label="DATE" value={entry.date} mono />
          <PropertyRow label="DESCRIPTION" value={entry.description} />
          <PropertyRow label="ACCOUNT" value={entry.account} mono />
          <PropertyRow label="AMOUNT" value={formatCents(entry.amountCents)} mono />
        </dl>
        <p className="border-t border-border px-2 py-2 text-[10px] leading-snug text-ink-dim">
          {archived
            ? "Archived entries stay in the ledger: no row is ever deleted."
            : "Editing writes through the mutation hooks; archiving keeps the row and changes its status."}
        </p>
      </Panel>

      <Link
        to="/entries"
        className="font-mono text-[11px] text-orange underline-offset-2 hover:underline"
      >
        ← BACK TO ENTRIES
      </Link>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Archive ${entry.id}?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              CANCEL
            </Button>
            <Button
              variant="danger"
              disabled={archive.isPending}
              onClick={() => {
                archive.mutate(entry.id, { onSuccess: () => setConfirming(false) });
              }}
            >
              {archive.isPending ? "ARCHIVING…" : "ARCHIVE"}
            </Button>
          </>
        }
      >
        <p className="p-3 text-[11px] leading-relaxed text-ink">
          The entry moves to <Badge>ARCHIVED</Badge> and stays in the ledger. Nothing is deleted.
        </p>
      </Modal>
    </div>
  );
}

function PropertyRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-2 py-1 text-[10px] last:border-b-0">
      <dt className="uppercase tracking-[0.06em] text-ink-dim">{label}</dt>
      <dd
        className={mono ? "truncate text-right font-mono text-ink" : "truncate text-right text-ink"}
      >
        {value}
      </dd>
    </div>
  );
}
