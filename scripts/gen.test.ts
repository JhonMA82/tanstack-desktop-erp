import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { generateModule, generatePage } from "./gen";

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

describe("gen module", () => {
  test("writes the whole pattern and registers the module", async () => {
    const written = await generateModule("inventory", { root, label: "INVENTORY" });

    expect(written).toEqual([
      "src/routes/inventory.tsx",
      "src/routes/inventory.index.tsx",
      "src/data/inventory.ts",
      "src/components/inventory/InventoryOverview.tsx",
    ]);

    for (const relative of written) {
      expect(existsSync(path.join(root, relative))).toBe(true);
    }

    const layout = await read("src/routes/inventory.tsx");
    // The trap this generator exists to prevent.
    expect(layout).toContain("<Outlet />");
    expect(layout).toContain('createFileRoute("/inventory")');

    const index = await read("src/routes/inventory.index.tsx");
    expect(index).toContain("ensureQueryData(inventoryQueryOptions)");
    expect(index).toContain("useSuspenseQuery(inventoryQueryOptions)");

    const registry = await read("src/config/navigation.ts");
    expect(registry).toContain('label: "INVENTORY"');
    expect(registry).toContain('path: "/inventory"');
    // The marker survives, so the next run has where to insert.
    expect(registry).toContain("// gen:modules");
    expect(registry).toContain("// gen:pages");

    const tree = await read("src/routeTree.gen.ts");
    expect(tree).toContain("/inventory");
  });

  test("emits files that parse", async () => {
    const files: [Bun.Transpiler, string][] = [
      [tsx, "src/routes/inventory.tsx"],
      [tsx, "src/routes/inventory.index.tsx"],
      [ts, "src/data/inventory.ts"],
      [tsx, "src/components/inventory/InventoryOverview.tsx"],
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

describe("gen page", () => {
  test("writes the nested route and lists it under its module", async () => {
    const written = await generatePage("inventory", "items", { root, label: "ITEMS" });

    expect(written).toEqual(["src/routes/inventory.items.tsx"]);

    const page = await read("src/routes/inventory.items.tsx");
    expect(page).toContain('createFileRoute("/inventory/items")');
    expect(() => tsx.transformSync(page)).not.toThrow();

    const registry = await read("src/config/navigation.ts");
    expect(registry).toContain('moduleId: "inventory"');
    expect(registry).toContain('path: "/inventory/items"');

    const tree = await read("src/routeTree.gen.ts");
    expect(tree).toContain("/inventory/items");
  });

  test("refuses a page of an unknown module", async () => {
    await expect(generatePage("nowhere", "items", { root })).rejects.toThrow(/Unknown module/);
  });

  test("refuses a page that already exists", async () => {
    await expect(generatePage("inventory", "items", { root })).rejects.toThrow(
      /already registered/,
    );
  });
});
