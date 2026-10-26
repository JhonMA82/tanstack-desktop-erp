import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  type InitValues,
  initialsOf,
  initProject,
  resetGitHistory,
  rewriteAppConfig,
  rewritePackageJson,
  rewriteReadme,
  slugify,
} from "./init";

const repoRoot = path.resolve(import.meta.dir, "..");

/** Runs `fn` with no git identity configured, the way a CI runner looks. */
function withoutGitIdentity<T>(fn: () => T): T {
  const saved = {
    global: process.env.GIT_CONFIG_GLOBAL,
    system: process.env.GIT_CONFIG_SYSTEM,
    noSystem: process.env.GIT_CONFIG_NOSYSTEM,
  };
  process.env.GIT_CONFIG_GLOBAL = "/dev/null";
  process.env.GIT_CONFIG_SYSTEM = "/dev/null";
  process.env.GIT_CONFIG_NOSYSTEM = "1";

  try {
    return fn();
  } finally {
    for (const [key, value] of Object.entries({
      GIT_CONFIG_GLOBAL: saved.global,
      GIT_CONFIG_SYSTEM: saved.system,
      GIT_CONFIG_NOSYSTEM: saved.noSystem,
    })) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

const VALUES: InitValues = {
  name: "Sales Ops",
  slug: "sales-ops",
  org: "SALES",
  initials: "SO",
  currency: "EUR",
  version: "0.1.0",
};

describe("derive values", () => {
  test("slugifies a product name", () => {
    expect(slugify("Sales Ops")).toBe("sales-ops");
    expect(slugify("  Ñandú  ERP ")).toBe("nandu-erp");
    expect(slugify("A/B Test")).toBe("a-b-test");
  });

  test("derives initials from the organization", () => {
    expect(initialsOf("ACME CORP")).toBe("AC");
    expect(initialsOf("WORKSPACE")).toBe("WO");
    expect(initialsOf("sales-ops")).toBe("SO");
  });
});

describe("pure rewriters", () => {
  let appSource: string;
  let packageSource: string;
  let readmeSource: string;

  beforeAll(async () => {
    appSource = await readFile(path.join(repoRoot, "src/config/app.ts"), "utf8");
    packageSource = await readFile(path.join(repoRoot, "package.json"), "utf8");
    readmeSource = await readFile(path.join(repoRoot, "README.md"), "utf8");
  });

  test("rewrites the brand and company blocks, keeping the docs", () => {
    const next = rewriteAppConfig(appSource, VALUES);

    expect(next).toContain('name: "Sales Ops"');
    expect(next).toContain('organization: "SALES"');
    expect(next).toContain('initials: "SO"');
    expect(next).toContain('version: "0.1.0"');
    expect(next).toContain("PROJECT: SALES-OPS.app");
    expect(next).toContain("SALES OPS v0.1.0 — DESKTOP EDITION");

    // Company block: same field, different block.
    const company = next.slice(next.indexOf("export const COMPANY"));
    expect(company).toContain('name: "SALES"');
    expect(company).toContain('currency: "EUR"');

    // Comments and untouched fields survive.
    expect(next).toContain("/** Product name in the top bar brand. */");
    expect(next).toContain('mark: "●"');
    expect(next).toContain('fiscalYear: "2024-2025"');
  });

  test("rewrites package name and version only", () => {
    const next = rewritePackageJson(packageSource, VALUES);
    const parsed = JSON.parse(next);

    expect(parsed.name).toBe("sales-ops");
    expect(parsed.version).toBe("0.1.0");
    expect(parsed.dependencies["@tanstack/react-router"]).toBe("1.170.38");
    expect(next.endsWith("\n")).toBe(true);
  });

  test("retitles the README and replaces the template slug", () => {
    const next = rewriteReadme(readmeSource, VALUES);

    expect(next.startsWith("# Sales Ops")).toBe(true);
    expect(next).not.toContain("tanstack-desktop-erp");
  });
});

describe("initProject", () => {
  let root: string;
  let specBefore: string;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "init-test-"));
    await mkdir(path.join(root, "src/config"), { recursive: true });
    await mkdir(path.join(root, ".thinkrail/context"), { recursive: true });
    await cp(path.join(repoRoot, "src/config/app.ts"), path.join(root, "src/config/app.ts"));
    await cp(path.join(repoRoot, "README.md"), path.join(root, "README.md"));
    await cp(path.join(repoRoot, "package.json"), path.join(root, "package.json"));
    await cp(path.join(repoRoot, "SPEC.md"), path.join(root, "SPEC.md"));
    await writeFile(path.join(root, ".thinkrail/context/TASK-demo.md"), "# temp", "utf8");
    await writeFile(path.join(root, ".thinkrail/context/keep.txt"), "durable", "utf8");
    specBefore = await readFile(path.join(root, "SPEC.md"), "utf8");
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("rebrands the project and removes the temporary task specs", () => {
    const changed = initProject(root, VALUES, { git: false });

    expect(changed).toContain("src/config/app.ts");
    expect(changed).toContain("package.json");
    expect(changed).toContain("README.md");
    expect(changed).toContain("- .thinkrail/context/TASK-demo.md");

    expect(existsSync(path.join(root, ".thinkrail/context/TASK-demo.md"))).toBe(false);
    expect(existsSync(path.join(root, ".thinkrail/context/keep.txt"))).toBe(true);
    expect(changed).not.toContain("~ .git (history reset)");
  });

  test("leaves SPEC.md untouched: it documents the inherited architecture", async () => {
    expect(await readFile(path.join(root, "SPEC.md"), "utf8")).toBe(specBefore);
  });

  test("the rebranded files parse", async () => {
    const app = await readFile(path.join(root, "src/config/app.ts"), "utf8");
    const packageJson = await readFile(path.join(root, "package.json"), "utf8");

    expect(() => new Bun.Transpiler({ loader: "ts" }).transformSync(app)).not.toThrow();
    expect(() => JSON.parse(packageJson)).not.toThrow();
  });
});

describe("initProject without an inherited repository", () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "init-fresh-test-"));
    await mkdir(path.join(root, "src/config"), { recursive: true });
    await cp(path.join(repoRoot, "src/config/app.ts"), path.join(root, "src/config/app.ts"));
    await cp(path.join(repoRoot, "package.json"), path.join(root, "package.json"));
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("creates the repository and the initial commit", () => {
    // A tarball / "Use this template" copy arrives without .git.
    expect(existsSync(path.join(root, ".git"))).toBe(false);

    const changed = withoutGitIdentity(() => initProject(root, VALUES));

    expect(changed).toContain("+ .git (repository created)");
    const log = Bun.spawnSync(["git", "log", "--oneline"], { cwd: root, stdout: "pipe" });
    expect(new TextDecoder().decode(log.stdout).trim().split("\n")).toHaveLength(1);
  });
});

describe("resetGitHistory", () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "init-git-test-"));
    await writeFile(path.join(root, "file.txt"), "x", "utf8");
    await mkdir(path.join(root, ".git"), { recursive: true });
    await writeFile(path.join(root, ".git/HEAD"), "ref: refs/heads/main", "utf8");
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  test("replaces the inherited history with one initial commit", () => {
    withoutGitIdentity(() => resetGitHistory(root));

    const log = Bun.spawnSync(["git", "log", "--oneline"], { cwd: root, stdout: "pipe" });
    const lines = new TextDecoder().decode(log.stdout).trim().split("\n");

    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("chore: initialize from template");
  });
});
