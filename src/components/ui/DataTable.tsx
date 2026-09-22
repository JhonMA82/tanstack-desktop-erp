import type { ColumnDef, PaginationState, RowData } from "@tanstack/react-table";
import {
  columnFilteringFeature,
  columnSizingFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Input } from "./Input";
import { Select } from "./Select";

/**
 * Feature set shared by every ERP table (TanStack Table v9): global quick
 * filter with `includesString`, explicit column widths and optional row
 * pagination (page size `Infinity` renders every row on a single page).
 * Declare this once at module scope so TypeScript binds every column def.
 */
export const erpTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  columnSizingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { includesString: filterFn_includesString },
});

/** Column definition type bound to the shared ERP table features. */
export type ErpColumnDef<TData extends RowData> = ColumnDef<typeof erpTableFeatures, TData>;

const PAGE_SIZE_ITEMS = [10, 20, 30, 40, 50];

export interface DataTableProps<TData extends RowData> {
  /** Header title (e.g. `RECENT TRANSACTIONS • 6 ROWS`). */
  title: ReactNode;
  /** Right-aligned header content (totals, counters, actions). */
  actions?: ReactNode;
  /** Column definitions (`ErpColumnDef`); columns without `size` fill the remainder. */
  columns: ErpColumnDef<TData>[];
  data: TData[];
  /** When set, renders the header quick-filter input bound to the global filter. */
  filterPlaceholder?: string;
  /** Controlled quick-filter value for an external toolbar search box. */
  searchValue?: string;
  /** Receives quick-filter changes when `searchValue` is controlled. */
  onSearchValueChange?: (value: string) => void;
  /** Toolbar rendered between the header bar and the table (filters, descriptions). */
  toolbar?: ReactNode;
  /** Renders the pagination footer and pages the rows. */
  paginated?: boolean;
  /** Rows per page when `paginated` (default 10). */
  pageSize?: number;
  /** Changes to this value reset the page index (e.g. external filters changed). */
  resetKey?: string;
  /** Message rendered when the (filtered) table has no rows. */
  emptyMessage?: string;
}

/**
 * Generic data table built on TanStack Table v9: header bar with optional
 * quick filter, optional toolbar and pagination footer, semantic `<table>`
 * markup and hairline Blender-style cells.
 */
export function DataTable<TData extends RowData>({
  title,
  actions,
  columns,
  data,
  filterPlaceholder,
  searchValue,
  onSearchValueChange,
  toolbar,
  paginated = false,
  pageSize = 10,
  resetKey,
  emptyMessage = "NO ROWS",
}: DataTableProps<TData>) {
  const controlled = searchValue !== undefined && onSearchValueChange !== undefined;
  const [internalFilter, setInternalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize });

  const globalFilter = controlled ? searchValue : internalFilter;

  const applyFilter = (updater: string | ((prev: string) => string)) => {
    const next = typeof updater === "function" ? updater(globalFilter) : updater;
    setPagination((current) => ({ ...current, pageIndex: 0 }));
    if (controlled) {
      onSearchValueChange?.(next);
    } else {
      setInternalFilter(next);
    }
  };

  useEffect(() => {
    if (resetKey !== undefined) {
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }
  }, [resetKey]);

  const table = useTable({
    features: erpTableFeatures,
    columns,
    data,
    state: {
      globalFilter,
      pagination: paginated ? pagination : { pageIndex: 0, pageSize: Number.POSITIVE_INFINITY },
    },
    onGlobalFilterChange: applyFilter,
    onPaginationChange: setPagination,
    globalFilterFn: "includesString",
  });
  const visibleRows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-[2px] border border-border bg-panel">
      <div className="flex h-6 items-center justify-between gap-2 border-b border-border bg-panel2 px-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-dim">
        <span className="truncate">{title}</span>
        <div className="flex shrink-0 items-center gap-2">
          {filterPlaceholder && !controlled ? (
            <Input
              aria-label="Quick filter"
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(event) => applyFilter(event.target.value)}
              className="h-[22px] w-40 text-[10px]"
            />
          ) : null}
          {actions ? (
            <span className="font-mono text-[9px] normal-case tracking-normal">{actions}</span>
          ) : null}
        </div>
      </div>
      {toolbar}
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
      {paginated ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-panel2 px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] tracking-[0.06em] text-ink-dim uppercase">
              Rows per page
            </span>
            <Select
              aria-label="Rows per page"
              value={String(pagination.pageSize)}
              onChange={(event) =>
                setPagination({ pageIndex: 0, pageSize: Number(event.target.value) })
              }
              className="h-5 w-14 text-[10px]"
            >
              {PAGE_SIZE_ITEMS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
          <span className="font-mono text-[10px] text-ink">
            Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </span>
          <div className="flex items-center gap-1">
            <PageButton
              label="First page"
              glyph="«"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
            />
            <PageButton
              label="Previous page"
              glyph="‹"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            />
            <PageButton
              label="Next page"
              glyph="›"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            />
            <PageButton
              label="Last page"
              glyph="»"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PageButton({
  label,
  glyph,
  disabled,
  onClick,
}: {
  label: string;
  glyph: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[2px] border border-border bg-panel font-mono text-[11px] text-ink-dim hover:text-ink-bright disabled:cursor-not-allowed disabled:opacity-40"
    >
      {glyph}
    </button>
  );
}
