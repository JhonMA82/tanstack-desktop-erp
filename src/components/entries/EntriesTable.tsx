import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/Button";
import type { AppColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EntryRow, EntryStatus } from "@/data/entries";
import { formatCents } from "@/lib/format";

const STATUS_TONE: Record<EntryStatus, StatusTone> = {
  DRAFT: "warning",
  POSTED: "positive",
  ARCHIVED: "neutral",
};

const COLUMNS: AppColumnDef<EntryRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    cell: ({ row }) => (
      <Link
        to="/entries/$entryId"
        params={{ entryId: row.original.id }}
        className="font-mono text-orange underline-offset-2 hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "DATE",
    size: 100,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "description",
    header: "DESCRIPTION",
  },
  {
    accessorKey: "account",
    header: "ACCOUNT",
    size: 150,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "amountCents",
    header: "AMOUNT",
    size: 110,
    cell: ({ getValue }) => (
      <span className="block text-right font-mono font-bold">
        {formatCents(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    size: 100,
    cell: ({ row }) => (
      <StatusBadge tone={STATUS_TONE[row.original.status]}>{row.original.status}</StatusBadge>
    ),
  },
];

export interface EntriesTableProps {
  entries: EntryRow[];
  /** Header counter (e.g. `6 ENTRIES`). */
  total: string;
}

/** Ledger list: rows link to the detail page, the header opens the create form. */
export function EntriesTable({ entries, total }: EntriesTableProps) {
  const navigate = useNavigate();

  return (
    <DataTable
      title="ENTRIES • LEDGER"
      actions={
        <span className="flex items-center gap-2">
          {total}
          <Button size="sm" variant="primary" onClick={() => void navigate({ to: "/entries/new" })}>
            NEW ENTRY
          </Button>
        </span>
      }
      columns={COLUMNS}
      data={entries}
      filterPlaceholder="FILTER ENTRIES"
    />
  );
}
