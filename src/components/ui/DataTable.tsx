import type { ColumnDef, RowData } from "@tanstack/react-table";
import {
  columnFilteringFeature,
  columnSizingFeature,
  createFilteredRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useState } from "react";
import { Input } from "./Input";

/**
 * Feature set shared by every ERP table (TanStack Table v9): global quick
 * filter with the `includesString` function and explicit column widths.
 * Declare this once at module scope so TypeScript binds every column def.
 */
export const erpTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnSizingFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

/** Column definition type bound to the shared ERP table features. */
export type ErpColumnDef<TData extends RowData> = ColumnDef<typeof erpTableFeatures, TData>;

export interface DataTableProps<TData extends RowData> {
  /** Header title (e.g. `RECENT TRANSACTIONS • 6 ROWS`). */
  title: ReactNode;
  /** Right-aligned header content (totals, counters). */
  actions?: ReactNode;
  /** Column definitions (`ErpColumnDef`); columns without `size` fill the remainder. */
  columns: ErpColumnDef<TData>[];
  data: TData[];
  /** When set, renders a quick-filter input bound to the global filter. */
  filterPlaceholder?: string;
  /** Message rendered when the (filtered) table has no rows. */
  emptyMessage?: string;
}

/**
 * Generic data table built on TanStack Table v9: header bar with optional
 * quick filter, semantic `<table>` markup and hairline Blender-style cells.
 */
export function DataTable<TData extends RowData>({
  title,
  actions,
  columns,
  data,
  filterPlaceholder,
  emptyMessage = "NO ROWS",
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const table = useTable({
    features: erpTableFeatures,
    columns,
    data,
    state: { globalFilter },
    onGlobalFilterChange: (updater) => {
      setGlobalFilter((prev) => (typeof updater === "function" ? updater(prev) : updater));
    },
    globalFilterFn: "includesString",
  });
  const visibleRows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-[2px] border border-border bg-panel">
      <div className="flex h-6 items-center justify-between gap-2 border-b border-border bg-panel2 px-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-dim">
        <span className="truncate">{title}</span>
        <div className="flex shrink-0 items-center gap-2">
          {filterPlaceholder ? (
            <Input
              aria-label="Quick filter"
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="h-[22px] w-40 text-[10px]"
            />
          ) : null}
          {actions ? (
            <span className="font-mono text-[9px] normal-case tracking-normal">{actions}</span>
          ) : null}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <colgroup>
            {table.getAllLeafColumns().map((column) => (
              <col
                key={column.id}
                style={column.columnDef.size ? { width: column.columnDef.size } : undefined}
              />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="h-6 border-r border-border bg-panel2 px-1.5 text-left text-[10px] font-bold uppercase tracking-[0.06em] text-ink-dim last:border-r-0"
                  >
                    <table.FlexRender header={header} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-10 text-center font-mono text-[10px] text-ink-dim"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-border bg-panel">
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="h-7 overflow-hidden text-ellipsis whitespace-nowrap border-r border-border/60 px-1.5 last:border-r-0"
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
