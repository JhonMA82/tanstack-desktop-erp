import { useMemo, useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import type { BadgeTone } from "@/components/ui/Badge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ErpColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { CustomerRow } from "@/data/admin-dashboard";
import { CUSTOMERS } from "@/data/admin-dashboard";
import { cn } from "@/lib/cn";

const STATUS_TONES: Record<CustomerRow["status"], BadgeTone> = {
  Subscribed: "green",
  Inactive: "default",
  Unsubscribed: "red",
};

const BILLING_TONES: Record<CustomerRow["billing"], { tone: BadgeTone; dot: string }> = {
  Paid: { tone: "green", dot: "bg-green" },
  Pending: { tone: "blue", dot: "bg-blue" },
  Overdue: { tone: "red", dot: "bg-red" },
  Trial: { tone: "default", dot: "bg-ink-dim" },
};

const STATUS_OPTIONS = ["all", "Subscribed", "Inactive", "Unsubscribed"] as const;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
] as const;

const COLUMNS: ErpColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-[4px] border border-border bg-panel2 text-ink-dim">
          <Icon name="user" size={12} />
        </span>
        <span className="grid gap-0.5">
          <span className="truncate text-[11px] font-medium text-ink-bright">
            {row.original.name}
          </span>
          <span className="truncate font-mono text-[9px] text-ink-dim">#{row.original.id}</span>
        </span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 120,
    cell: ({ row }) => (
      <Badge tone={STATUS_TONES[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "billing",
    header: "Billing",
    size: 110,
    cell: ({ row }) => (
      <Badge tone={BILLING_TONES[row.original.billing].tone}>
        <span
          className={cn("size-1.5 rounded-full", BILLING_TONES[row.original.billing].dot)}
          aria-hidden="true"
        />
        {row.original.billing}
      </Badge>
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    size: 90,
  },
  {
    accessorKey: "joined",
    header: "Joined",
    size: 110,
    cell: ({ getValue }) => (
      <span className="font-mono">
        {new Date(getValue<string>()).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        })}
      </span>
    ),
  },
];

/**
 * Subscriber overview from the reference admin dashboard: export action,
 * toolbar (search + status + sort) and the paginated customers table.
 */
export function SubscriberOverviewSection() {
  const { push } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const rows = useMemo(() => {
    const filtered =
      status === "all" ? CUSTOMERS : CUSTOMERS.filter((customer) => customer.status === status);
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.joined.localeCompare(b.joined);
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      return b.joined.localeCompare(a.joined);
    });
  }, [status, sort]);

  return (
    <DataTable
      title="18,426 Customers"
      actions={
        <Button
          size="sm"
          onClick={() =>
            push({
              kind: "SUCCESS",
              title: "EXPORTED",
              message: `Customers CSV — ${rows.length} rows — customers_2026-04.csv`,
            })
          }
        >
          Export
        </Button>
      }
      columns={COLUMNS}
      data={rows}
      searchValue={search}
      onSearchValueChange={setSearch}
      paginated
      pageSize={10}
      resetKey={`${status}-${sort}`}
      emptyMessage="NO RESULTS."
      toolbar={
        <div className="flex flex-col gap-1.5 border-b border-border bg-panel-out p-1.5">
          <p className="text-[10px] text-ink-dim">
            Recent customer records with plan, billing, status, and signup activity.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex w-full max-w-80 items-center sm:w-80">
              <span
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-ink-dim"
                aria-hidden="true"
              >
                <Icon name="search" size={10} />
              </span>
              <Input
                aria-label="Search customers"
                placeholder="Search customers..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-6 w-full pl-7 text-[10px]"
              />
            </span>
            <Select
              aria-label="Status filter"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-6 w-36 text-[10px]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All statuses" : option}
                </option>
              ))}
            </Select>
            <Select
              aria-label="Sort customers"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-6 w-36 text-[10px]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      }
    />
  );
}
