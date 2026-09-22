import type { ErpColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Transaction } from "@/data/dashboard";

export interface RecentTransactionsProps {
  /** Transactions to display (the dashboard passes the first 6 rows). */
  transactions: Transaction[];
  /** Header total (e.g. `$42,128.00`). */
  total: string;
}

const COLUMNS: ErpColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "vendor",
    header: "VENDOR",
  },
  {
    id: "amount",
    accessorFn: (row) => row.credit || row.debit,
    header: "AMOUNT",
    size: 90,
    cell: ({ getValue }) => (
      <span className="block text-right font-mono font-bold">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    size: 70,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

/** Recent transactions table (TanStack Table) with status badges and a header total. */
export function RecentTransactions({ transactions, total }: RecentTransactionsProps) {
  return (
    <DataTable
      title={`RECENT TRANSACTIONS • ${transactions.length} ROWS`}
      actions={`TOTAL ${total}`}
      columns={COLUMNS}
      data={transactions}
      filterPlaceholder="QUICK FILTER"
    />
  );
}
