import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { generateForm, generateModule, generatePage } from "./gen";

const repoRoot = path.resolve(import.meta.dir, "..");
const tsx = new Bun.Transpiler({ loader: "tsx" });
const ts = new Bun.Transpiler({ loader: "ts" });

let root: string;

/**
 * The generator is what keeps `AGENTS.md` honest: if its templates drift from the
 * canonical pattern, the files it writes stop parsing and these tests fail.
 */
beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "gen-test-"));
  await mkdir(path.join(root, "src/routes"), { recursive: true });
  await mkdir(path.join(root, "src/config"), { recursive: true });
  await cp(path.join(repoRoot, "src/routes/__root.tsx"), path.join(root, "src/routes/__root.tsx"));
  await cp(
    path.join(repoRoot, "src/config/navigation.ts"),
    path.join(root, "src/config/navigation.ts"),
  );
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

const read = (relative: string) => readFile(path.join(root, relative), "utf8");
const exists = (relative: string) => existsSync(path.join(root, relative));

describe("gen module", () => {
  test("writes a CRUD-ready slice: contract, list, detail and registry", async () => {
    const written = await generateModule("inventory", {
      root,
      entity: "item",
      label: "INVENTORY",
    });

    expect(written).toEqual([
      "src/routes/inventory.tsx",
      "src/routes/inventory.index.tsx",
      "src/routes/inventory.$itemId.tsx",
      "src/routes/inventory.$itemId.index.tsx",
      "src/data/inventory.ts",
      "src/components/inventory/ItemTable.tsx",
    ]);
    for (const relative of written) {
      expect(exists(relative)).toBe(true);
    }

    // Module layout, and the param layout that makes the detail a child.
    expect(await read("src/routes/inventory.tsx")).toContain("<Outlet />");
    expect(await read("src/routes/inventory.$itemId.tsx")).toContain("<Outlet />");

    const detail = await read("src/routes/inventory.$itemId.index.tsx");
    expect(detail).toContain("itemQueryOptions(params.itemId)");
    expect(detail).toContain("Route.useParams()");

    const data = await read("src/data/inventory.ts");
    expect(data).toContain("export interface ItemRow");
    expect(data).toContain("export interface ItemInput");
    expect(data).toContain("export const itemInputSchema");
    expect(data).toContain("export async function createItem");
    expect(data).toContain("export async function updateItem");
    expect(data).toContain("export async function archiveItem");
    expect(data).toContain("export const inventoryQueryKey");

    const table = await read("src/components/inventory/ItemTable.tsx");
    expect(table).toContain('to="/inventory/$itemId"');
    expect(table).toContain("params={{ itemId: row.original.id }}");

    const registry = await read("src/config/navigation.ts");
    expect(registry).toContain('label: "INVENTORY"');
    expect(registry).toContain('path: "/inventory"');
    expect(registry).toContain("// gen:modules");
    expect(registry).toContain("// gen:pages");

    const tree = await read("src/routeTree.gen.ts");
    expect(tree).toContain("/inventory");
    expect(tree).toContain("/inventory/$itemId");
  });

  test("emits files that parse", async () => {
    const files: [Bun.Transpiler, string][] = [
      [tsx, "src/routes/inventory.tsx"],
      [tsx, "src/routes/inventory.index.tsx"],
      [tsx, "src/routes/inventory.$itemId.tsx"],
      [tsx, "src/routes/inventory.$itemId.index.tsx"],
      [ts, "src/data/inventory.ts"],
      [tsx, "src/components/inventory/ItemTable.tsx"],
    ];

    for (const [transpiler, relative] of files) {
      const source = await read(relative);
      expect(() => transpiler.transformSync(source)).not.toThrow();
    }
  });

  test("refuses an id that is already registered", async () => {
    await expect(generateModule("inventory", { root })).rejects.toThrow(/already registered/);
  });

  test("rejects ids that are not slugs", async () => {
    await expect(generateModule("Bad Id", { root })).rejects.toThrow(/Invalid module id/);
  });
});

describe("gen form", () => {
  test("writes the form, its mutation hooks and the create/edit routes", async () => {
    const written = await generateForm("inventory", "item", { root });

    expect(written).toEqual([
      "src/components/inventory/use-item-mutations.ts",
      "src/components/inventory/ItemForm.tsx",
      "src/routes/inventory.new.tsx",
      "src/routes/inventory.$itemId.edit.tsx",
    ]);
    for (const relative of written) {
      expect(exists(relative)).toBe(true);
    }

    const form = await read("src/components/inventory/ItemForm.tsx");
    expect(form).toContain("useForm(");
    expect(form).toContain("validators: { onSubmit: itemInputSchema }");
    expect(() => tsx.transformSync(form)).not.toThrow();

    const hook = await read("src/components/inventory/use-item-mutations.ts");
    expect(hook).toContain("export function useCreateItem");
    expect(hook).toContain("export function useUpdateItem");
    expect(hook).toContain("export function useArchiveItem");
    expect(() => ts.transformSync(hook)).not.toThrow();

    // The create page is a real route but not a navigation destination.
    const registry = await read("src/config/navigation.ts");
    expect(registry).toContain('path: "/inventory/new"');
    expect(registry).toContain("hidden: true");

    const tree = await read("src/routeTree.gen.ts");
    expect(tree).toContain("/inventory/new");
    expect(tree).toContain("/inventory/$itemId/edit");
  });

  test("refuses a module that does not exist", async () => {
    await expect(generateForm("nowhere", "thing", { root })).rejects.toThrow(/Unknown module/);
  });

  test("refuses to run twice", async () => {
    await expect(generateForm("inventory", "item", { root })).rejects.toThrow(
      /already has a create page/,
    );
  });
});

describe("gen page", () => {
  test("adds a static nested page and registers it", async () => {
    const written = await generatePage("inventory", "reports", { root, label: "REPORTS" });

    expect(written).toEqual(["src/routes/inventory.reports.tsx"]);
    const page = await read("src/routes/inventory.reports.tsx");
    expect(page).toContain('createFileRoute("/inventory/reports")');
    expect(() => tsx.transformSync(page)).not.toThrow();

    const registry = await read("src/config/navigation.ts");
    expect(registry).toContain('path: "/inventory/reports"');

    const tree = await read("src/routeTree.gen.ts");
    expect(tree).toContain("/inventory/reports");
  });

  test("refuses a page of an unknown module", async () => {
    await expect(generatePage("nowhere", "items", { root })).rejects.toThrow(/Unknown module/);
  });

  test("refuses a page that already exists", async () => {
    await expect(generatePage("inventory", "reports", { root })).rejects.toThrow(
      /already registered/,
    );
  });
});
