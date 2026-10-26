import type { AppColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ActivityRow, ActivityStatus } from "@/data/overview";

const STATUS_TONE: Record<ActivityStatus, StatusTone> = {
  ACTIVE: "positive",
  PENDING: "warning",
  ARCHIVED: "neutral",
};

const COLUMNS: AppColumnDef<ActivityRow>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "at",
    header: "DATE",
    size: 100,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "subject",
    header: "SUBJECT",
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    size: 120,
    cell: ({ getValue }) => (
      <span className="font-mono text-[10px] uppercase">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    size: 90,
    cell: ({ row }) => (
      <StatusBadge tone={STATUS_TONE[row.original.status]}>{row.original.status}</StatusBadge>
    ),
  },
];

export interface ActivityTableProps {
  activity: ActivityRow[];
  /** Header counter (e.g. `5 RECORDS`). */
  total: string;
}

/** Recent-activity table (TanStack Table) with tone badges and a header counter. */
export function ActivityTable({ activity, total }: ActivityTableProps) {
  return (
    <DataTable
      title="RECENT ACTIVITY"
      actions={total}
      columns={COLUMNS}
      data={activity}
      filterPlaceholder="QUICK FILTER"
    />
  );
}
