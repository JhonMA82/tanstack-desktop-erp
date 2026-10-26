import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError, getJson, sendJson, simulateLatency } from "@/lib/api";
import { DATA_SOURCE } from "@/lib/env";

export type EntryStatus = "DRAFT" | "POSTED" | "ARCHIVED";

/** A ledger entry. Money is integer cents: never a float. */
export interface EntryRow {
  id: string;
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
  description: string;
  account: string;
  /** Integer cents (`125050` = $1,250.50). */
  amountCents: number;
  status: EntryStatus;
}

export interface EntryList {
  entries: EntryRow[];
  /** Header counter (e.g. `6 ENTRIES`). */
  totalLabel: string;
}

/**
 * Payload shared by the form and the HTTP body. `id` is assigned by the server and
 * archiving is an action, not an editable field, so both stay out of the input.
 */
export interface EntryInput {
  date: string;
  description: string;
  account: string;
  amountCents: number;
  status: Exclude<EntryStatus, "ARCHIVED">;
}

const statusSchema = z.enum(["DRAFT", "POSTED", "ARCHIVED"]);
const inputStatusSchema = z.enum(["DRAFT", "POSTED"]);

/**
 * Input contract: the form validates with it and the HTTP payload uses it. The
 * second generic pins the schema's *input* type too — Standard Schema (and therefore
 * TanStack Form) checks it, and without it the field would be `unknown`.
 */
export const entryInputSchema: z.ZodType<EntryInput, EntryInput> = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date"),
  description: z.string().trim().min(1, "Description is required").max(80, "Too long"),
  account: z.string().trim().min(1, "Account is required").max(40, "Too long"),
  amountCents: z
    .number()
    .refine((value) => Number.isInteger(value), "Use whole cents")
    .refine((value) => value > 0, "Must be greater than zero"),
  status: inputStatusSchema,
});

const entrySchema: z.ZodType<EntryRow> = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  account: z.string(),
  amountCents: z.number(),
  status: statusSchema,
});

/** Wire contract of `/entries`; the mock fixture is validated with it too. */
const entriesSchema: z.ZodType<EntryList> = z.object({
  entries: z.array(entrySchema),
  totalLabel: z.string(),
});

const FIXTURE: EntryRow[] = [
  {
    id: "ENT-1042",
    date: "2024-11-18",
    description: "Vendor invoice — cloud hosting",
    account: "6100 Software",
    amountCents: 128000,
    status: "POSTED",
  },
  {
    id: "ENT-1041",
    date: "2024-11-15",
    description: "Client invoice — November",
    account: "1100 Receivables",
    amountCents: 850000,
    status: "POSTED",
  },
  {
    id: "ENT-1040",
    date: "2024-11-14",
    description: "Payroll accrual",
    account: "5100 Salaries",
    amountCents: 1240000,
    status: "DRAFT",
  },
  {
    id: "ENT-1039",
    date: "2024-11-09",
    description: "Office rent — Q4",
    account: "6300 Rent",
    amountCents: 375000,
    status: "POSTED",
  },
  {
    id: "ENT-1038",
    date: "2024-11-05",
    description: "Bank fees",
    account: "6400 Fees",
    amountCents: 4250,
    status: "POSTED",
  },
  {
    id: "ENT-1037",
    date: "2024-10-30",
    description: "Prepaid insurance",
    account: "1300 Prepaid",
    amountCents: 96000,
    status: "ARCHIVED",
  },
];

/**
 * Session store of the mock adapter: writes land here and disappear on reload, so
 * create/edit/archive are visible in the list right after the cache invalidation.
 * In `http` mode the API owns the state and this is never read.
 */
let store: EntryRow[] = FIXTURE.map((row) => ({ ...row }));

/** Restores the fixture; the tests use it to isolate the mock store. */
export function resetEntryStore(): void {
  store = FIXTURE.map((row) => ({ ...row }));
}

function totalLabel(rows: EntryRow[]): string {
  return `${rows.length} ${rows.length === 1 ? "ENTRY" : "ENTRIES"}`;
}

function nextId(): string {
  const highest = store.reduce((max, row) => {
    const numeric = Number(row.id.replace(/\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return `ENT-${highest + 1}`;
}

/** Reads the list from the configured origin (mock fixture or `GET /entries`). */
export async function fetchEntryList(): Promise<EntryList> {
  if (DATA_SOURCE === "http") {
    return getJson("/entries", entriesSchema);
  }

  await simulateLatency();
  return entriesSchema.parse({ entries: store, totalLabel: totalLabel(store) });
}

/** Reads one entry: `GET /entries/:id`, or the mock store. */
export async function fetchEntry(id: string): Promise<EntryRow> {
  if (DATA_SOURCE === "http") {
    return getJson(`/entries/${id}`, entrySchema);
  }

  await simulateLatency();
  const found = store.find((row) => row.id === id);
  if (!found) {
    throw new ApiError(`Entry ${id} not found`, 404);
  }
  return entrySchema.parse(found);
}

/** Creates an entry: `POST /entries`, or an insert into the mock store. */
export async function createEntry(input: EntryInput): Promise<EntryRow> {
  if (DATA_SOURCE === "http") {
    return sendJson("POST", "/entries", entryInputSchema.parse(input), entrySchema);
  }

  await simulateLatency();
  const row: EntryRow = { ...entryInputSchema.parse(input), id: nextId() };
  store = [row, ...store];
  return entrySchema.parse(row);
}

/** Updates an entry: `PATCH /entries/:id`, or an in-place update. */
export async function updateEntry(id: string, input: EntryInput): Promise<EntryRow> {
  if (DATA_SOURCE === "http") {
    return sendJson("PATCH", `/entries/${id}`, entryInputSchema.parse(input), entrySchema);
  }

  await simulateLatency();
  const current = store.find((row) => row.id === id);
  if (!current) {
    throw new ApiError(`Entry ${id} not found`, 404);
  }
  const updated: EntryRow = { ...current, ...entryInputSchema.parse(input) };
  store = store.map((row) => (row.id === id ? updated : row));
  return entrySchema.parse(updated);
}

/**
 * Archives an entry: `DELETE /entries/:id` (the API returns the archived row) or a
 * status change in the mock. There is no hard delete: an accountant never loses a row.
 */
export async function archiveEntry(id: string): Promise<EntryRow> {
  if (DATA_SOURCE === "http") {
    return sendJson("DELETE", `/entries/${id}`, undefined, entrySchema);
  }

  await simulateLatency();
  const current = store.find((row) => row.id === id);
  if (!current) {
    throw new ApiError(`Entry ${id} not found`, 404);
  }
  const archived: EntryRow = { ...current, status: "ARCHIVED" };
  store = store.map((row) => (row.id === id ? archived : row));
  return entrySchema.parse(archived);
}

/** Root key of the resource; mutations invalidate it to refresh list and detail. */
export const entriesQueryKey = ["entries"] as const;

/** TanStack Query options for the list (key: `["entries"]`). */
export const entriesQueryOptions = queryOptions({
  queryKey: entriesQueryKey,
  queryFn: fetchEntryList,
});

/** TanStack Query options for one entry (key: `["entries", id]`). */
export function entryQueryOptions(id: string) {
  return queryOptions({
    queryKey: [...entriesQueryKey, id] as const,
    queryFn: () => fetchEntry(id),
  });
}
