import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateRouteTree } from "./routes";

/**
 * Scaffolds a module or a nested page from the same pattern the base uses, so an
 * agent never re-derives the structure by hand.
 *
 *   bun run gen module <id> --label "INVENTORY" [--count "—"]
 *   bun run gen page <module> <page> [--label "ITEMS"]
 *
 * Non-interactive on purpose (flags only). It writes every file of the canonical
 * pattern, inserts the registry entry at the `gen:` marker, regenerates
 * `routeTree.gen.ts` and formats what it touched.
 */

const MARKER_MODULES = "  // gen:modules";
const MARKER_PAGES = "  // gen:pages";
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export interface Options {
  root: string;
  label?: string;
  count?: string;
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

// ------------------------------------------------------------------- templates

function dataFile(id: string): string {
  const Name = pascal(id);
  const name = camel(id);
  const prefix = id.slice(0, 3).toUpperCase();

  return `import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { getJson, simulateLatency } from "@/lib/api";
import { DATA_SOURCE } from "@/lib/env";

export type ${Name}Status = "ACTIVE" | "PENDING" | "ARCHIVED";

export interface ${Name}Record {
  id: string;
  name: string;
  status: ${Name}Status;
}

export interface ${Name}Data {
  records: ${Name}Record[];
  /** Header counter of the table (e.g. "3 RECORDS"). */
  totalLabel: string;
}

const recordSchema: z.ZodType<${Name}Record> = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["ACTIVE", "PENDING", "ARCHIVED"]),
});

/** Wire contract of /${id}; the mock fixture is validated with it too. */
const ${name}Schema: z.ZodType<${Name}Data> = z.object({
  records: z.array(recordSchema),
  totalLabel: z.string(),
});

/** Replace this placeholder payload with your domain data. */
const FIXTURE: ${Name}Data = {
  records: [
    { id: "${prefix}-1001", name: "First record", status: "ACTIVE" },
    { id: "${prefix}-1002", name: "Second record", status: "PENDING" },
    { id: "${prefix}-1003", name: "Third record", status: "ARCHIVED" },
  ],
  totalLabel: "3 RECORDS",
};

/**
 * Loads the payload from the configured data origin: the mock fixture behind
 * simulated latency, or GET /${id} validated against the contract.
 */
export async function fetch${Name}(): Promise<${Name}Data> {
  if (DATA_SOURCE === "http") {
    return getJson("/${id}", ${name}Schema);
  }

  await simulateLatency();
  return ${name}Schema.parse(FIXTURE);
}

/** TanStack Query options for the payload (key: ["${id}"]). */
export const ${name}QueryOptions = queryOptions({
  queryKey: ["${id}"],
  queryFn: fetch${Name},
});
`;
}

function overviewComponent(id: string): string {
  const Name = pascal(id);

  return `import type { AppColumnDef } from "@/components/ui/DataTable";
import { DataTable } from "@/components/ui/DataTable";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ${Name}Record, ${Name}Status } from "@/data/${id}";

const STATUS_TONE: Record<${Name}Status, StatusTone> = {
  ACTIVE: "positive",
  PENDING: "warning",
  ARCHIVED: "neutral",
};

const COLUMNS: AppColumnDef<${Name}Record>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    cell: ({ getValue }) => <span className="font-mono">{getValue<string>()}</span>,
  },
  {
    accessorKey: "name",
    header: "NAME",
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

export interface ${Name}OverviewProps {
  records: ${Name}Record[];
  /** Header counter (e.g. "3 RECORDS"). */
  total: string;
}

/** Replace these columns with the module's real presentational widgets. */
export function ${Name}Overview({ records, total }: ${Name}OverviewProps) {
  return (
    <DataTable
      title="${upper(id)} • RECORDS"
      actions={total}
      columns={COLUMNS}
      data={records}
      filterPlaceholder="QUICK FILTER"
    />
  );
}
`;
}

function layoutRoute(id: string): string {
  const Name = pascal(id);

  return `import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout of the ${upper(id)} module. Every module keeps this shape — a layout that
 * renders its <Outlet/> plus an index page — so nested pages never need the parent
 * rewritten (bun run gen page relies on it).
 */
export const Route = createFileRoute("/${id}")({
  component: ${Name}Layout,
});

function ${Name}Layout() {
  return <Outlet />;
}
`;
}

function indexRoute(id: string): string {
  const Name = pascal(id);
  const name = camel(id);

  return `import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ${Name}Overview } from "@/components/${id}/${Name}Overview";
import { ${name}QueryOptions } from "@/data/${id}";

/** Index page of the ${upper(id)} module: awaits its data before painting. */
export const Route = createFileRoute("/${id}/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(${name}QueryOptions),
  component: ${Name}Page,
});

function ${Name}Page() {
  const { data } = useSuspenseQuery(${name}QueryOptions);

  return (
    <div className="flex flex-col gap-2 p-2">
      <${Name}Overview records={data.records} total={data.totalLabel} />
    </div>
  );
}
`;
}

function moduleEntry(id: string, label: string, count: string): string {
  return `  {
    id: "${id}",
    label: "${label}",
    path: "/${id}",
    count: "${count}",
    description: "Replace this description with the module's purpose.",
    ribbon: [
      {
        label: "${pascal(id)}",
        actions: [
          {
            id: "new-record",
            size: "large",
            icon: "plus",
            label: "New\\nRecord",
            tone: "accent",
            notify: { kind: "INFO", title: "NEW RECORD", message: "Record composer" },
          },
        ],
      },
    ],
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

/** Formats what was written and refreshes the route tree, so the repo stays green. */
async function finalize(root: string, files: string[]): Promise<void> {
  await format(root, files);
  await generateRouteTree(root);
}

// -------------------------------------------------------------------- commands

export async function generateModule(id: string, options: Options): Promise<string[]> {
  if (!ID_PATTERN.test(id)) {
    throw new Error(`Invalid module id "${id}": use lowercase letters, digits and dashes.`);
  }
  if ((await modulesSection(options.root)).includes(`id: "${id}"`)) {
    throw new Error(`Module "${id}" is already registered in src/config/navigation.ts.`);
  }

  const label = sanitizeLabel(options.label ?? upper(id)) || upper(id);
  const count = sanitizeLabel(options.count ?? "—") || "—";

  const written = [
    await writeNew(options.root, `src/routes/${id}.tsx`, layoutRoute(id)),
    await writeNew(options.root, `src/routes/${id}.index.tsx`, indexRoute(id)),
    await writeNew(options.root, `src/data/${id}.ts`, dataFile(id)),
    await writeNew(
      options.root,
      `src/components/${id}/${pascal(id)}Overview.tsx`,
      overviewComponent(id),
    ),
  ];

  await insertAtMarker(
    options.root,
    "src/config/navigation.ts",
    MARKER_MODULES,
    moduleEntry(id, label, count),
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

// ------------------------------------------------------------------------- CLI

const FLAGS = new Set(["--label", "--count", "--root"]);

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
    } else {
      options.root = path.resolve(value);
    }
  }

  return { command: positional.shift(), positional, options };
}

const USAGE = `Usage:
  bun run gen module <id> [--label "LABEL"] [--count "—"]
  bun run gen page <module> <page> [--label "LABEL"]

Options:
  --root <dir>   Scaffold into another checkout (used by the generator tests).`;

async function main(): Promise<void> {
  const { command, positional, options } = parseArgs(Bun.argv.slice(2));

  if (command !== "module" && command !== "page") {
    console.error(USAGE);
    process.exit(1);
  }

  const written =
    command === "module"
      ? await generateModule(positional[0], options)
      : await generatePage(positional[0], positional[1], options);

  const verb = command === "module" ? "Module" : "Page";
  const name = command === "module" ? positional[0] : `${positional[0]} / ${positional[1]}`;
  console.log(`${verb} "${name}" scaffolded:\n`);
  for (const file of written) {
    console.log(`  + ${file}`);
  }
  console.log("  ~ src/config/navigation.ts");
  console.log("  ~ src/routeTree.gen.ts (regenerated)\n");
  console.log(
    command === "module"
      ? "Next: fill the data fixture and the widgets, then run bun run dev."
      : "Next: fill the page content, then run bun run dev.",
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
