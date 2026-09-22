import { useQuery } from "@tanstack/react-query";
import type { ErpColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Transaction } from "@/data/dashboard";
import { dashboardQueryOptions } from "@/data/dashboard";

const COLUMNS: ErpColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 110,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "date",
    header: "DATE",
    size: 90,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "vendor",
    header: "VENDOR / CUSTOMER",
  },
  {
    accessorKey: "account",
    header: "ACCOUNT",
    size: 120,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    id: "amount",
    accessorFn: (row) => row.credit || row.debit,
    header: "AMOUNT",
    size: 100,
    cell: ({ getValue }) => (
      <span className="block text-right font-mono font-bold">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    size: 80,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

/** Full-width DataTable example: six columns, quick filter, dashboard fixtures. */
export function TableSection() {
  const { data, isPending } = useQuery(dashboardQueryOptions);

  if (isPending || !data) {
    return (
      <Panel title="Table">
        <p className="p-3 font-mono text-[11px] text-ink-dim">LOADING TABLE…</p>
      </Panel>
    );
  }

  return (
    <DataTable
      title={`Example Table • ${data.transactions.length} ROWS`}
      actions={`TOTAL ${data.total}`}
      columns={COLUMNS}
      data={data.transactions}
      filterPlaceholder="FILTER"
    />
  );
}
