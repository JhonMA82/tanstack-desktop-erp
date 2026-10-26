import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateRouteTree } from "./routes";

/**
 * Scaffolds the base's own patterns so an agent never re-derives them by hand.
 *
 *   bun run gen module <id> [--entity <singular>] [--label "LABEL"]
 *   bun run gen page <module> <page> [--label "LABEL"]
 *   bun run gen form <module> <entity>
 *
 * `gen module` emits a CRUD-ready slice: contract + mock store + reads + writes,
 * the list, the detail route under a param and the registry entry. `gen form` adds
 * the form, its mutation hooks and the create/edit pages. Non-interactive on
 * purpose (flags only); every command formats what it wrote and regenerates
 * `routeTree.gen.ts`.
 */

const MARKER_MODULES = "  // gen:modules";
const MARKER_PAGES = "  // gen:pages";
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export interface Options {
  root: string;
  label?: string;
  count?: string;
  /** Singular name of the entity (`entry` for the `entries` module). Defaults to the id. */
  entity?: string;
}

// ---------------------------------------------------------------- name helpers

/** `purchase-orders` -> `PurchaseOrders`. */
function pascal(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** `purchase-orders` -> `purchaseOrders`. */
function camel(id: string): string {
  const [first, ...rest] = id.split("-");
  return first + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

/** `purchase-orders` -> `PURCHASE ORDERS`. */
function upper(id: string): string {
  return id.replace(/-/g, " ").toUpperCase();
}

/** Strips the characters that would break an emitted string literal. */
function sanitizeLabel(label: string): string {
  return label.replace(/["\\\n\r]/g, "").trim();
}

/** Everything the templates need to name things, derived from one pair of ids. */
interface Names {
  /** Module id (`entries`). */
  id: string;
  /** Entity slug (`entry`). */
  entity: string;
  /** Route param (`entryId`). */
  param: string;
  /** `Entry`. */
  Name: string;
  /** `entry`. */
  name: string;
  /** `entries`. */
  ids: string;
  /** `ENTRY`. */
  NAME: string;
  /** `ENT`. */
  prefix: string;
}

function namesFor(id: string, entity = id): Names {
  return {
    id,
    entity,
    param: `${camel(entity)}Id`,
    Name: pascal(entity),
    name: camel(entity),
    ids: camel(id),
    NAME: upper(entity),
    prefix: entity.slice(0, 3).toUpperCase(),
  };
}

// ---------------------------------------------------------------- file writing

async function writeNew(root: string, relative: string, content: string): Promise<string> {
  const target = path.join(root, relative);
  if (existsSync(target)) {
    throw new Error(`${relative} already exists — refusing to overwrite.`);
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, "utf8");
  return relative;
}

/** Inserts an entry right before a `gen:` marker, keeping the marker for the next run. */
async function insertAtMarker(root: string, file: string, marker: string, block: string) {
  const target = path.join(root, file);
  const source = await readFile(target, "utf8");
  const at = source.indexOf(marker);
  if (at === -1) {
    throw new Error(`Marker "${marker}" not found in ${file}.`);
  }
  await writeFile(target, `${source.slice(0, at)}${block}${source.slice(at)}`, "utf8");
}

/** Runs the local formatter on the touched files; skipped when it is not installed. */
async function format(root: string, files: string[]): Promise<void> {
  const bin = path.join(root, "node_modules", ".bin", "biome");
  if (!existsSync(bin)) {
    return;
  }
  const proc = Bun.spawn([bin, "check", "--write", ...files], {
    cwd: root,
    stdout: "ignore",
    stderr: "pipe",
  });
  const code = await proc.exited;
  if (code !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Formatter failed on the generated files:\n${stderr}`);
  }
}

async function readRegistry(root: string): Promise<string> {
  return readFile(path.join(root, "src/config/navigation.ts"), "utf8");
}

/** Cuts the registry source between two anchors, so checks stay inside that section. */
function section(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  return from === -1 ? "" : source.slice(from, to === -1 ? undefined : to);
}

async function modulesSection(root: string): Promise<string> {
  return section(await readRegistry(root), "export const MODULES", "export const PAGES");
}

async function pagesSection(root: string): Promise<string> {
  return section(
    await readRegistry(root),
    "export const PAGES",
    "export const DEFAULT_MODULE_PATH",
  );
}

/** Formats and refreshes the route tree, so the repo stays green after a command. */
async function finalize(root: string, files: string[]): Promise<void> {
  await format(root, files);
  await generateRouteTree(root);
}

// --------------------------------------------------------------- data contract

function dataFile(n: Names): string {
  return `import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { ApiError, getJson, sendJson, simulateLatency } from "@/lib/api";
import { DATA_SOURCE } from "@/lib/env";

export type ${n.Name}Status = "DRAFT" | "POSTED" | "ARCHIVED";

export interface ${n.Name}Row {
  id: string;
  name: string;
  status: ${n.Name}Status;
}

export interface ${n.Name}List {
  ${n.ids}: ${n.Name}Row[];
  totalLabel: string;
}

/** Payload shared by the form and the HTTP body: no id, no archived state. */
export interface ${n.Name}Input {
  name: string;
  status: Exclude<${n.Name}Status, "ARCHIVED">;
}

/** Input contract: the form validates with it and the HTTP payload uses it. */
export const ${n.name}InputSchema: z.ZodType<${n.Name}Input, ${n.Name}Input> = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Too long"),
  status: z.enum(["DRAFT", "POSTED"]),
});

const statusSchema = z.enum(["DRAFT", "POSTED", "ARCHIVED"]);

const rowSchema: z.ZodType<${n.Name}Row> = z.object({
  id: z.string(),
  name: z.string(),
  status: statusSchema,
});

/** Wire contract of /${n.id}; the mock fixture is validated with it too. */
const listSchema: z.ZodType<${n.Name}List> = z.object({
  ${n.ids}: z.array(rowSchema),
  totalLabel: z.string(),
});

const FIXTURE: ${n.Name}Row[] = [
  { id: "${n.prefix}-1001", name: "First record", status: "POSTED" },
  { id: "${n.prefix}-1002", name: "Second record", status: "DRAFT" },
  { id: "${n.prefix}-1003", name: "Third record", status: "ARCHIVED" },
];

/**
 * Session store of the mock adapter: writes land here and disappear on reload, so
 * create/edit/archive show up right after the cache invalidation. In http mode the
 * API owns the state and this is never read.
 */
let store: ${n.Name}Row[] = FIXTURE.map((row) => ({ ...row }));

/** Restores the fixture; the tests use it to isolate the mock store. */
export function reset${n.Name}Store(): void {
  store = FIXTURE.map((row) => ({ ...row }));
}

function totalLabel(rows: ${n.Name}Row[]): string {
  return \`\${rows.length} ROWS\`;
}

function nextId(): string {
  const highest = store.reduce((max, row) => {
    const numeric = Number(row.id.replace(/\\D/g, ""));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return \`${n.prefix}-\${String(highest + 1)}\`;
}

/** Reads the list from the configured origin. */
export async function fetch${n.Name}List(): Promise<${n.Name}List> {
  if (DATA_SOURCE === "http") {
    return getJson("/${n.id}", listSchema);
  }

  await simulateLatency();
  return listSchema.parse({ ${n.ids}: store, totalLabel: totalLabel(store) });
}

/** Reads one row by id. */
export async function fetch${n.Name}(id: string): Promise<${n.Name}Row> {
  if (DATA_SOURCE === "http") {
    return getJson(\`/${n.id}/\${id}\`, rowSchema);
  }

  await simulateLatency();
  const found = store.find((row) => row.id === id);
  if (!found) {
    throw new ApiError(\`${n.Name} \${id} not found\`, 404);
  }
  return rowSchema.parse(found);
}

/** Creates a row: POST in http mode, an insert in the mock store. */
export async function create${n.Name}(input: ${n.Name}Input): Promise<${n.Name}Row> {
  if (DATA_SOURCE === "http") {
    return sendJson("POST", "/${n.id}", ${n.name}InputSchema.parse(input), rowSchema);
  }

  await simulateLatency();
  const row: ${n.Name}Row = { ...${n.name}InputSchema.parse(input), id: nextId() };
  store = [row, ...store];
  return rowSchema.parse(row);
}

/** Updates a row in place. */
export async function update${n.Name}(id: string, input: ${n.Name}Input): Promise<${n.Name}Row> {
  if (DATA_SOURCE === "http") {
    return sendJson("PATCH", \`/${n.id}/\${id}\`, ${n.name}InputSchema.parse(input), rowSchema);
  }

  await simulateLatency();
  const current = store.find((row) => row.id === id);
  if (!current) {
    throw new ApiError(\`${n.Name} \${id} not found\`, 404);
  }
  const updated: ${n.Name}Row = { ...current, ...${n.name}InputSchema.parse(input) };
  store = store.map((row) => (row.id === id ? updated : row));
  return rowSchema.parse(updated);
}

/** Archives instead of deleting: an archived row stays in the list. */
export async function archive${n.Name}(id: string): Promise<${n.Name}Row> {
  if (DATA_SOURCE === "http") {
    return sendJson("DELETE", \`/${n.id}/\${id}\`, undefined, rowSchema);
  }

  await simulateLatency();
  const current = store.find((row) => row.id === id);
  if (!current) {
    throw new ApiError(\`${n.Name} \${id} not found\`, 404);
  }
  const archived: ${n.Name}Row = { ...current, status: "ARCHIVED" };
  store = store.map((row) => (row.id === id ? archived : row));
  return rowSchema.parse(archived);
}

/** Root key of the resource; mutations invalidate it to refresh list and detail. */
export const ${n.ids}QueryKey = ["${n.id}"] as const;

/** TanStack Query options for the list (key: ["${n.id}"]). */
export const ${n.ids}QueryOptions = queryOptions({
  queryKey: ${n.ids}QueryKey,
  queryFn: fetch${n.Name}List,
});

/** TanStack Query options for one row (key: ["${n.id}", id]). */
export function ${n.name}QueryOptions(id: string) {
  return queryOptions({
    queryKey: [...${n.ids}QueryKey, id] as const,
    queryFn: () => fetch${n.Name}(id),
  });
}
`;
}

// ------------------------------------------------------------------ components

function tableComponent(n: Names): string {
  return `import { Link } from "@tanstack/react-router";
import type { AppColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ${n.Name}Row, ${n.Name}Status } from "@/data/${n.id}";

const STATUS_TONE: Record<${n.Name}Status, StatusTone> = {
  DRAFT: "warning",
  POSTED: "positive",
  ARCHIVED: "neutral",
};

const COLUMNS: AppColumnDef<${n.Name}Row>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 110,
    cell: ({ row }) => (
      <Link
        to="/${n.id}/$${n.param}"
        params={{ ${n.param}: row.original.id }}
        className="font-mono text-orange underline-offset-2 hover:underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "${n.NAME}",
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

export interface ${n.Name}TableProps {
  rows: ${n.Name}Row[];
  /** Header counter (e.g. "3 ROWS"). */
  total: string;
}

/** List of the module: the id links to the detail page. */
export function ${n.Name}Table({ rows, total }: ${n.Name}TableProps) {
  return (
    <DataTable
      title="${n.NAME}S"
      actions={total}
      columns={COLUMNS}
      data={rows}
      filterPlaceholder="FILTER ${n.NAME}S"
    />
  );
}
`;
}

function mutationsHook(n: Names): string {
  return `import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/feedback/toaster";
import type { ${n.Name}Input, ${n.Name}Row } from "@/data/${n.id}";
import { archive${n.Name}, create${n.Name}, ${n.ids}QueryKey, update${n.Name} } from "@/data/${n.id}";
import { errorMessage } from "@/lib/api";

/**
 * Write path of the module: one hook per mutation, all sharing the same shape —
 * invalidate the resource, toast the outcome, and let the page decide where to go
 * through \`onDone\`. Pages stay free of cache and error plumbing.
 */
function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ${n.ids}QueryKey });
}

export function useCreate${n.Name}(onDone?: (row: ${n.Name}Row) => void) {
  const invalidate = useInvalidate();
  const { push } = useToast();

  return useMutation({
    mutationFn: (input: ${n.Name}Input) => create${n.Name}(input),
    onSuccess: (row) => {
      void invalidate();
      push({ kind: "SUCCESS", title: "CREATED", message: row.id });
      onDone?.(row);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "CREATE FAILED", message: errorMessage(error) });
    },
  });
}

export function useUpdate${n.Name}(onDone?: (row: ${n.Name}Row) => void) {
  const invalidate = useInvalidate();
  const { push } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ${n.Name}Input }) =>
      update${n.Name}(id, input),
    onSuccess: (row) => {
      void invalidate();
      push({ kind: "SUCCESS", title: "SAVED", message: \`\${row.id} — updated\` });
      onDone?.(row);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "SAVE FAILED", message: errorMessage(error) });
    },
  });
}

export function useArchive${n.Name}(onDone?: (row: ${n.Name}Row) => void) {
  const invalidate = useInvalidate();
  const { push } = useToast();

  return useMutation({
    mutationFn: (id: string) => archive${n.Name}(id),
    onSuccess: (row) => {
      void invalidate();
      push({ kind: "WARN", title: "ARCHIVED", message: \`\${row.id} — kept in the ledger\` });
      onDone?.(row);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "ARCHIVE FAILED", message: errorMessage(error) });
    },
  });
}
`;
}

function formComponent(n: Names): string {
  return `import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/Button";
import { FormSelectField, FormTextField } from "@/components/ui/FormField";
import { Panel } from "@/components/ui/Panel";
import type { ${n.Name}Input } from "@/data/${n.id}";
import { ${n.name}InputSchema } from "@/data/${n.id}";

/** Blank input for the create page. */
export function empty${n.Name}(): ${n.Name}Input {
  return { name: "", status: "DRAFT" };
}

export interface ${n.Name}FormProps {
  /** Values the form starts with: blank for create, the stored row for edit. */
  defaultValues: ${n.Name}Input;
  submitLabel: string;
  /** Mutation in flight: disables the submit button. */
  isPending?: boolean;
  onSubmit: (input: ${n.Name}Input) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * TanStack Form validates with the same zod schema the data layer uses, and the
 * FormField primitives wire the label, the hint and the field errors.
 * Replace the fields to match the resource's input contract.
 */
export function ${n.Name}Form({
  defaultValues,
  submitLabel,
  isPending = false,
  onSubmit,
  onCancel,
}: ${n.Name}FormProps) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: ${n.name}InputSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Panel title="${n.NAME}">
        <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2">
          <form.Field name="name">
            {(field) => <FormTextField field={field} id="name" label="NAME" />}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <FormSelectField
                field={field}
                id="status"
                label="STATUS"
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "POSTED", label: "Posted" },
                ]}
              />
            )}
          </form.Field>
        </div>
      </Panel>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          CANCEL
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" variant="primary" disabled={!canSubmit || isSubmitting || isPending}>
              {isSubmitting || isPending ? "SAVING…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
`;
}

// --------------------------------------------------------------------- routes

function layoutRoute(n: Names): string {
  return `import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout of the ${n.NAME} module. Every module keeps this shape — a layout that
 * renders its <Outlet/> plus an index page — so nested pages never need the parent
 * rewritten (bun run gen page relies on it).
 */
export const Route = createFileRoute("/${n.id}")({
  component: ${n.Name}Layout,
});

function ${n.Name}Layout() {
  return <Outlet />;
}
`;
}

function indexRoute(n: Names): string {
  return `import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ${n.Name}Table } from "@/components/${n.id}/${n.Name}Table";
import { ${n.ids}QueryOptions } from "@/data/${n.id}";

export const Route = createFileRoute("/${n.id}/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(${n.ids}QueryOptions),
  component: ${n.Name}ListPage,
});

function ${n.Name}ListPage() {
  const { data } = useSuspenseQuery(${n.ids}QueryOptions);

  return (
    <div className="p-2">
      <${n.Name}Table rows={data.${n.ids}} total={data.totalLabel} />
    </div>
  );
}
`;
}

function paramLayoutRoute(n: Names): string {
  return `import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout of \`/${n.id}/$${n.param}\`. It exists so the detail (index) and the edit
 * page live under the same segment: a route with children must render its
 * <Outlet/>, or the child silently never paints.
 */
export const Route = createFileRoute("/${n.id}/$${n.param}")({
  component: ${n.Name}DetailLayout,
});

function ${n.Name}DetailLayout() {
  return <Outlet />;
}
`;
}

function detailRoute(n: Names): string {
  return `import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel } from "@/components/ui/Panel";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ${n.Name}Status } from "@/data/${n.id}";
import { ${n.name}QueryOptions } from "@/data/${n.id}";

const STATUS_TONE: Record<${n.Name}Status, StatusTone> = {
  DRAFT: "warning",
  POSTED: "positive",
  ARCHIVED: "neutral",
};

/** Detail page: reads the row by its route param. */
export const Route = createFileRoute("/${n.id}/$${n.param}/")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(${n.name}QueryOptions(params.${n.param})),
  component: ${n.Name}DetailPage,
});

function ${n.Name}DetailPage() {
  const params = Route.useParams();
  const { data: row } = useSuspenseQuery(${n.name}QueryOptions(params.${n.param}));

  return (
    <div className="flex flex-col gap-2 p-2">
      <Panel
        title={\`${n.NAME} • \${row.id}\`}
        actions={<StatusBadge tone={STATUS_TONE[row.status]}>{row.status}</StatusBadge>}
      >
        <div className="flex flex-col gap-1 p-3">
          <span className="font-mono text-[12px] text-ink-bright">{row.name}</span>
          <span className="font-mono text-[10px] text-ink-dim">
            Replace this panel with the ${n.name} detail.
          </span>
        </div>
      </Panel>
      <Link
        to="/${n.id}"
        className="font-mono text-[11px] text-orange underline-offset-2 hover:underline"
      >
        ← BACK TO ${n.NAME}S
      </Link>
    </div>
  );
}
`;
}

function newRoute(n: Names): string {
  return `import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { empty${n.Name}, ${n.Name}Form } from "@/components/${n.id}/${n.Name}Form";
import { useCreate${n.Name} } from "@/components/${n.id}/use-${n.entity}-mutations";

export const Route = createFileRoute("/${n.id}/new")({
  component: New${n.Name}Page,
});

function New${n.Name}Page() {
  const navigate = useNavigate();
  const create = useCreate${n.Name}((row) => {
    void navigate({ to: "/${n.id}/$${n.param}", params: { ${n.param}: row.id } });
  });

  return (
    <div className="p-2">
      <${n.Name}Form
        defaultValues={empty${n.Name}()}
        submitLabel="CREATE ${n.NAME}"
        isPending={create.isPending}
        // The hook already toasts the failure; the form stays open for a retry.
        onSubmit={(input) => create.mutateAsync(input).catch(() => undefined)}
        onCancel={() => void navigate({ to: "/${n.id}" })}
      />
    </div>
  );
}
`;
}

function editRoute(n: Names): string {
  return `import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ${n.Name}Form } from "@/components/${n.id}/${n.Name}Form";
import { useUpdate${n.Name} } from "@/components/${n.id}/use-${n.entity}-mutations";
import type { ${n.Name}Input } from "@/data/${n.id}";
import { ${n.name}QueryOptions } from "@/data/${n.id}";

export const Route = createFileRoute("/${n.id}/$${n.param}/edit")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(${n.name}QueryOptions(params.${n.param})),
  component: Edit${n.Name}Page,
});

function Edit${n.Name}Page() {
  const params = Route.useParams();
  const { data: row } = useSuspenseQuery(${n.name}QueryOptions(params.${n.param}));
  const navigate = useNavigate();
  const update = useUpdate${n.Name}((saved) => {
    void navigate({ to: "/${n.id}/$${n.param}", params: { ${n.param}: saved.id } });
  });

  if (row.status === "ARCHIVED") {
    return (
      <div className="p-2">
        <p className="font-mono text-[11px] text-ink-dim">
          {row.id} is archived and cannot be edited.{" "}
          <Link
            to="/${n.id}/$${n.param}"
            params={{ ${n.param}: row.id }}
            className="text-orange"
          >
            BACK TO DETAIL
          </Link>
        </p>
      </div>
    );
  }

  // Archived rows never reach the form: the input contract has no ARCHIVED status.
  const defaults: ${n.Name}Input = { name: row.name, status: row.status };

  return (
    <div className="p-2">
      <${n.Name}Form
        defaultValues={defaults}
        submitLabel="SAVE CHANGES"
        isPending={update.isPending}
        onSubmit={(input) => update.mutateAsync({ id: row.id, input }).catch(() => undefined)}
        onCancel={() =>
          void navigate({ to: "/${n.id}/$${n.param}", params: { ${n.param}: row.id } })
        }
      />
    </div>
  );
}
`;
}

function pageRoute(moduleId: string, pageId: string): string {
  const Module = pascal(moduleId);
  const Page = pascal(pageId);

  return `import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui/Panel";

/**
 * Nested page of ${upper(moduleId)}: it renders inside the module layout's <Outlet/>,
 * and /${moduleId}/${pageId} is shareable on its own.
 */
export const Route = createFileRoute("/${moduleId}/${pageId}")({
  component: ${Module}${Page}Page,
});

function ${Module}${Page}Page() {
  return (
    <div className="p-2">
      <Panel title="${upper(moduleId)} / ${upper(pageId)}">
        <p className="p-4 font-mono text-[11px] text-ink-dim">
          Replace this panel with the page content.
        </p>
      </Panel>
    </div>
  );
}
`;
}

// -------------------------------------------------------------------- registry

function moduleEntry(n: Names, label: string, count: string): string {
  return `  {
    id: "${n.id}",
    label: "${label}",
    path: "/${n.id}",
    count: "${count}",
    description: "Replace this description with the module's purpose.",
  },
`;
}

function pageEntry(moduleId: string, pageId: string, label: string): string {
  return `  {
    id: "${pageId}",
    moduleId: "${moduleId}",
    label: "${label}",
    path: "/${moduleId}/${pageId}",
  },
`;
}

function newPageEntry(n: Names): string {
  return `  {
    id: "new",
    moduleId: "${n.id}",
    label: "NEW ${n.NAME}",
    path: "/${n.id}/new",
    hidden: true,
  },
`;
}

// -------------------------------------------------------------------- commands

export async function generateModule(id: string, options: Options): Promise<string[]> {
  if (!ID_PATTERN.test(id)) {
    throw new Error(`Invalid module id "${id}": use lowercase letters, digits and dashes.`);
  }
  const entity = options.entity ?? id;
  if (!ID_PATTERN.test(entity)) {
    throw new Error(`Invalid entity "${entity}": use lowercase letters, digits and dashes.`);
  }
  if ((await modulesSection(options.root)).includes(`id: "${id}"`)) {
    throw new Error(`Module "${id}" is already registered in src/config/navigation.ts.`);
  }

  const n = namesFor(id, entity);
  const label = sanitizeLabel(options.label ?? upper(id)) || upper(id);
  const count = sanitizeLabel(options.count ?? "—") || "—";

  const written = [
    await writeNew(options.root, `src/routes/${id}.tsx`, layoutRoute(n)),
    await writeNew(options.root, `src/routes/${id}.index.tsx`, indexRoute(n)),
    await writeNew(options.root, `src/routes/${id}.$${n.param}.tsx`, paramLayoutRoute(n)),
    await writeNew(options.root, `src/routes/${id}.$${n.param}.index.tsx`, detailRoute(n)),
    await writeNew(options.root, `src/data/${id}.ts`, dataFile(n)),
    await writeNew(options.root, `src/components/${id}/${n.Name}Table.tsx`, tableComponent(n)),
  ];

  await insertAtMarker(
    options.root,
    "src/config/navigation.ts",
    MARKER_MODULES,
    moduleEntry(n, label, count),
  );
  await finalize(options.root, [...written, "src/config/navigation.ts"]);

  return written;
}

export async function generatePage(
  moduleId: string,
  pageId: string,
  options: Options,
): Promise<string[]> {
  if (!ID_PATTERN.test(moduleId) || !ID_PATTERN.test(pageId)) {
    throw new Error("Invalid id: use lowercase letters, digits and dashes.");
  }
  if (!(await modulesSection(options.root)).includes(`id: "${moduleId}"`)) {
    throw new Error(`Unknown module "${moduleId}": run "bun run gen module ${moduleId}" first.`);
  }
  if ((await pagesSection(options.root)).includes(`path: "/${moduleId}/${pageId}"`)) {
    throw new Error(`Page "/${moduleId}/${pageId}" is already registered.`);
  }

  const label = sanitizeLabel(options.label ?? upper(pageId)) || upper(pageId);

  const written = [
    await writeNew(
      options.root,
      `src/routes/${moduleId}.${pageId}.tsx`,
      pageRoute(moduleId, pageId),
    ),
  ];

  await insertAtMarker(
    options.root,
    "src/config/navigation.ts",
    MARKER_PAGES,
    pageEntry(moduleId, pageId, label),
  );
  await finalize(options.root, [...written, "src/config/navigation.ts"]);

  return written;
}

export async function generateForm(
  moduleId: string,
  entity: string,
  options: Options,
): Promise<string[]> {
  if (!ID_PATTERN.test(moduleId) || !ID_PATTERN.test(entity)) {
    throw new Error("Invalid id: use lowercase letters, digits and dashes.");
  }
  if (!(await modulesSection(options.root)).includes(`id: "${moduleId}"`)) {
    throw new Error(`Unknown module "${moduleId}": run "bun run gen module ${moduleId}" first.`);
  }

  const n = namesFor(moduleId, entity);

  // The data contract and the param layout come from `gen module`; refuse instead of
  // emitting imports that would not compile.
  for (const required of [`src/data/${moduleId}.ts`, `src/routes/${moduleId}.$${n.param}.tsx`]) {
    if (!existsSync(path.join(options.root, required))) {
      throw new Error(
        `Missing ${required}. The form needs the CRUD contract and the param layout: run "bun run gen module ${moduleId} --entity ${entity}" first.`,
      );
    }
  }
  if ((await pagesSection(options.root)).includes(`path: "/${moduleId}/new"`)) {
    throw new Error(`Module "${moduleId}" already has a create page.`);
  }

  for (const relative of [
    `src/components/${moduleId}/use-${entity}-mutations.ts`,
    `src/components/${moduleId}/${n.Name}Form.tsx`,
    `src/routes/${moduleId}.new.tsx`,
    `src/routes/${moduleId}.$${n.param}.edit.tsx`,
  ]) {
    if (existsSync(path.join(options.root, relative))) {
      throw new Error(`${relative} already exists — refusing to overwrite.`);
    }
  }

  const written = [
    await writeNew(
      options.root,
      `src/components/${moduleId}/use-${entity}-mutations.ts`,
      mutationsHook(n),
    ),
    await writeNew(options.root, `src/components/${moduleId}/${n.Name}Form.tsx`, formComponent(n)),
    await writeNew(options.root, `src/routes/${moduleId}.new.tsx`, newRoute(n)),
    await writeNew(options.root, `src/routes/${moduleId}.$${n.param}.edit.tsx`, editRoute(n)),
  ];

  await insertAtMarker(options.root, "src/config/navigation.ts", MARKER_PAGES, newPageEntry(n));
  await finalize(options.root, [...written, "src/config/navigation.ts"]);

  return written;
}

// ------------------------------------------------------------------------- CLI

const FLAGS = new Set(["--label", "--count", "--entity", "--root"]);

function parseArgs(argv: string[]): { command?: string; positional: string[]; options: Options } {
  const positional: string[] = [];
  const options: Options = { root: process.cwd() };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (!FLAGS.has(arg)) {
      positional.push(arg);
      continue;
    }
    if (value === undefined) {
      throw new Error(`Missing value for ${arg}.`);
    }
    index += 1;

    if (arg === "--label") {
      options.label = value;
    } else if (arg === "--count") {
      options.count = value;
    } else if (arg === "--entity") {
      options.entity = value;
    } else {
      options.root = path.resolve(value);
    }
  }

  return { command: positional.shift(), positional, options };
}

const USAGE = `Usage:
  bun run gen module <id> [--entity <singular>] [--label "LABEL"] [--count "—"]
  bun run gen page <module> <page> [--label "LABEL"]
  bun run gen form <module> <entity>

Options:
  --entity <name>  Singular name used for types and hooks ("entry" for "entries").
  --root <dir>     Scaffold into another checkout (used by the generator tests).`;

async function main(): Promise<void> {
  const { command, positional, options } = parseArgs(Bun.argv.slice(2));

  if (command !== "module" && command !== "page" && command !== "form") {
    console.error(USAGE);
    process.exit(1);
  }

  const written =
    command === "module"
      ? await generateModule(positional[0], options)
      : command === "page"
        ? await generatePage(positional[0], positional[1], options)
        : await generateForm(positional[0], positional[1], options);

  const name = positional.filter(Boolean).join(" / ");
  console.log(`${command} "${name}" scaffolded:\n`);
  for (const file of written) {
    console.log(`  + ${file}`);
  }
  console.log("  ~ src/config/navigation.ts");
  console.log("  ~ src/routeTree.gen.ts (regenerated)\n");
  console.log(
    command === "form"
      ? "Next: replace the form fields to match the input contract, then run bun run dev."
      : "Next: fill the data fixture and the widgets, then run bun run dev.",
  );
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
