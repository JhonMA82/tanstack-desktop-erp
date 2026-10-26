import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";

/**
 * Bootstraps a project created from this template: rebrands it, drops the
 * temporary task specs and (optionally) starts a fresh git history.
 *
 *   bun run init                 # asks for the name, organization, initials, currency
 *   bun run init --yes --name "Sales Ops" --org SALES
 *
 * `SPEC.md` is left untouched on purpose: it documents the architecture the new
 * project inherits, and the generator/registry rules still apply after rebranding.
 */

const TEMPLATE_PACKAGE = "tanstack-desktop-erp";
const APP_BLOCK = /export const APP = \{[\s\S]*?\} satisfies AppConfig;/;
const COMPANY_BLOCK = /export const COMPANY = \{[\s\S]*?\} satisfies CompanyConfig;/;

export interface InitValues {
  /** Product name shown in the top bar and the document title. */
  name: string;
  /** Kebab-case package name, derived from `name` unless overridden. */
  slug: string;
  /** Organization marker shown next to the brand. */
  org: string;
  /** Avatar initials (two characters). */
  initials: string;
  /** ISO 4217 currency shown in the inspector. */
  currency: string;
  /** Initial package version. */
  version: string;
}

// --------------------------------------------------------------------- helpers

/** `Sales Ops` -> `sales-ops`. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** `ACME CORP` -> `AC`, `WORKSPACE` -> `WO`. */
export function initialsOf(value: string): string {
  const parts = value
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2);
  const initials =
    parts.length > 1 ? parts.map((part) => part.charAt(0)).join("") : (parts[0] ?? "").slice(0, 2);
  return (initials || value.slice(0, 2)).toUpperCase();
}

/** Replaces one string field inside a config block, leaving comments untouched. */
function setStringField(block: string, field: string, value: string): string {
  const pattern = new RegExp(`(\\n\\s*${field}: )"[^"]*"`);
  if (!pattern.test(block)) {
    throw new Error(`Field "${field}" not found in the config block.`);
  }
  return block.replace(
    pattern,
    (_match, prefix: string) => `${prefix}"${value.replace(/"/g, "")}"`,
  );
}

// -------------------------------------------------------------- pure rewriters

/** Rewrites the brand and company blocks of `src/config/app.ts`. */
export function rewriteAppConfig(source: string, values: InitValues): string {
  const app = source.match(APP_BLOCK)?.[0];
  const company = source.match(COMPANY_BLOCK)?.[0];
  if (!app || !company) {
    throw new Error("src/config/app.ts no longer has the APP/COMPANY blocks.");
  }

  const nextApp = [
    ["name", values.name],
    ["version", values.version],
    ["filePath", `/workspace/${values.slug} — PROJECT: ${values.slug.toUpperCase()}.app`],
    ["organization", values.org],
    ["initials", values.initials],
    ["tagline", `${values.name.toUpperCase()} v${values.version} — DESKTOP EDITION`],
  ].reduce((block, [field, value]) => setStringField(block, field, value), app);

  const nextCompany = [
    ["name", values.org],
    ["currency", values.currency],
  ].reduce((block, [field, value]) => setStringField(block, field, value), company);

  return source.replace(APP_BLOCK, nextApp).replace(COMPANY_BLOCK, nextCompany);
}

/** Rewrites `name` and `version` of `package.json`, keeping key order and formatting. */
export function rewritePackageJson(source: string, values: InitValues): string {
  const parsed: Record<string, unknown> = JSON.parse(source);
  parsed.name = values.slug;
  parsed.version = values.version;
  return `${JSON.stringify(parsed, null, 2)}\n`;
}

/** Retitles the README and replaces the template slug with the project one. */
export function rewriteReadme(source: string, values: InitValues): string {
  const renamed = source.replaceAll(TEMPLATE_PACKAGE, values.slug);
  return renamed.replace(/^# .+$/m, `# ${values.name}`);
}

// ------------------------------------------------------------------ file system

function write(root: string, relative: string, content: string): void {
  writeFileSync(path.join(root, relative), content, "utf8");
}

function read(root: string, relative: string): string {
  return readFileSync(path.join(root, relative), "utf8");
}

/** Files that only exist to bootstrap: a derived project must not keep them. */
const BOOTSTRAP_FILES = ["scripts/init.ts", "scripts/init.test.ts"];

/**
 * Removes the one-shot bootstrap — this script, its test and its `package.json`
 * entry. `gen` and `routes:generate` stay: they are the tools a derived project
 * keeps using. The user chose this: `init` rewrites the brand and the history, so
 * leaving it around in a live project is a trap.
 */
function removeBootstrap(root: string): string[] {
  const changed: string[] = [];

  for (const relative of BOOTSTRAP_FILES) {
    const target = path.join(root, relative);
    if (existsSync(target)) {
      rmSync(target, { force: true });
      changed.push(`- ${relative}`);
    }
  }

  const packageJson = JSON.parse(read(root, "package.json")) as {
    scripts?: Record<string, string>;
  };
  if (packageJson.scripts && "init" in packageJson.scripts) {
    delete packageJson.scripts.init;
    write(root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
    changed.push('~ package.json (sin script "init")');
  }

  return changed;
}

const README_INTRO = `## Empezar a trabajar

El proyecto ya está inicializado: el nombre, la marca y la empresa salen de \`src/config/app.ts\`, y el
historial de git arranca en su commit inicial (la herramienta de bootstrap se eliminó a sí misma).
Para cada feature:
`;

/** Removes every doc line that still advertises the deleted command. */
function dropInitLines(source: string): string {
  return source
    .split("\n")
    .filter((line) => !/^\|\s*`bun run init`/.test(line)) // command-table row
    .filter((line) => !/^\s*bun run init\b/.test(line)) // bash example
    .join("\n");
}

/** Drops the bootstrap step from the docs the new project inherits. */
function pruneDocs(root: string): string[] {
  const changed: string[] = [];

  const readmePath = path.join(root, "README.md");
  if (existsSync(readmePath)) {
    const before = readFileSync(readmePath, "utf8");
    const filtered = dropInitLines(before);
    const start = filtered.indexOf("## Empezar un proyecto");
    const genBlock = filtered.indexOf("```bash\nbun run gen module", start);
    const after =
      start !== -1 && genBlock !== -1
        ? `${filtered.slice(0, start)}${README_INTRO}\n${filtered.slice(genBlock)}`
        : filtered;

    if (after !== before) {
      writeFileSync(readmePath, after, "utf8");
      changed.push("~ README.md (sin el paso de bootstrap)");
    }
  }

  const agentsPath = path.join(root, "AGENTS.md");
  if (existsSync(agentsPath)) {
    const before = readFileSync(agentsPath, "utf8");
    const after = dropInitLines(before);
    if (after !== before) {
      writeFileSync(agentsPath, after, "utf8");
      changed.push("~ AGENTS.md (sin `bun run init`)");
    }
  }

  return changed;
}

/** Removes the temporary task specs; the durable specs stay. */
function removeTaskSpecs(root: string): string[] {
  const directory = path.join(root, ".thinkrail", "context");
  if (!existsSync(directory)) {
    return [];
  }
  const removed = readdirSync(directory).filter((file) => file.startsWith("TASK-"));
  for (const file of removed) {
    rmSync(path.join(directory, file), { force: true });
  }
  return removed;
}

// -------------------------------------------------------------------------- git

function runGit(root: string, args: string[]): void {
  const result = Bun.spawnSync(["git", ...args], { cwd: root, stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) {
    const stderr = new TextDecoder().decode(result.stderr).trim();
    throw new Error(`git ${args.join(" ")} failed: ${stderr}`);
  }
}

/**
 * `-c` overrides for `git commit` when no identity is configured. A fresh machine
 * or a CI runner has none, and `git commit` would abort with "unknown author".
 * A configured identity always wins; this only fills the gap.
 */
function identityArgs(root: string): string[] {
  const configured = Bun.spawnSync(["git", "config", "user.email"], {
    cwd: root,
    stdout: "pipe",
    stderr: "pipe",
  });
  return configured.exitCode === 0
    ? []
    : ["-c", "user.name=Template", "-c", "user.email=template@localhost"];
}

/**
 * Starts a fresh history with a single initial commit. Works whether the copy
 * brought the template's `.git` or not (tarballs and "Use this template" clones
 * ship without it) and whether git has an identity configured.
 */
export function resetGitHistory(root: string): void {
  rmSync(path.join(root, ".git"), { recursive: true, force: true });
  runGit(root, ["init", "-q"]);
  runGit(root, ["add", "-A"]);
  runGit(root, [...identityArgs(root), "commit", "-q", "-m", "chore: initialize from template"]);
}

// ------------------------------------------------------------------- the script

export interface InitOptions {
  /** Whether to drop the inherited git history (defaults to true). */
  git?: boolean;
}

/** Applies every rewrite in `root` and reports what changed. */
export function initProject(root: string, values: InitValues, options: InitOptions = {}): string[] {
  const changed: string[] = [];

  const appSource = read(root, "src/config/app.ts");
  const nextApp = rewriteAppConfig(appSource, values);
  if (nextApp !== appSource) {
    write(root, "src/config/app.ts", nextApp);
    changed.push("src/config/app.ts");
  }

  const packageSource = read(root, "package.json");
  write(root, "package.json", rewritePackageJson(packageSource, values));
  changed.push("package.json");

  if (existsSync(path.join(root, "README.md"))) {
    write(root, "README.md", rewriteReadme(read(root, "README.md"), values));
    changed.push("README.md");
  }

  for (const file of removeTaskSpecs(root)) {
    changed.push(`- .thinkrail/context/${file}`);
  }

  // A derived project must not keep the bootstrap, and its docs must stop pointing at it.
  changed.push(...removeBootstrap(root));
  changed.push(...pruneDocs(root));

  if (options.git !== false) {
    const hadHistory = existsSync(path.join(root, ".git"));
    resetGitHistory(root);
    changed.push(hadHistory ? "~ .git (history reset)" : "+ .git (repository created)");
  }

  return changed;
}

const USAGE = `Bootstraps a project from this template.

Usage:
  bun run init [options]

Options:
  --name <name>          Product name (default: ask, then "App Core")
  --slug <slug>          Package name (default: derived from the name)
  --org <org>            Organization marker (default: ask, then "WORKSPACE")
  --initials <XX>        Avatar initials (default: derived from the org)
  --currency <code>      ISO 4217 currency (default: ask, then "USD")
  --version <version>    Initial version (default: "0.1.0")
  --no-git               Keep the inherited git history
  --yes                  Skip confirmations (required on the template repo itself)
  --root <dir>           Bootstrap another checkout (used by the tests)`;

function flag(argv: string[], name: string): string | undefined {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? undefined : argv[index + 1];
}

async function ask(question: string, fallback: string): Promise<string> {
  if (!process.stdin.isTTY) {
    return fallback;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} [${fallback}]: `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const argv = Bun.argv.slice(2);
  if (argv.includes("--help")) {
    console.log(USAGE);
    return;
  }

  const root = path.resolve(flag(argv, "root") ?? process.cwd());
  const yes = argv.includes("--yes");

  // The template repository itself would lose its own history: require an explicit --yes.
  const packageJson = read(root, "package.json");
  const isTemplate = (JSON.parse(packageJson).name as string) === TEMPLATE_PACKAGE;
  if (isTemplate && !yes) {
    console.error(
      `This is the template repository itself (package name "${TEMPLATE_PACKAGE}").\n` +
        "Create a project from it first, or re-run with --yes if you really mean to rebrand and reset this checkout.",
    );
    process.exit(1);
  }

  const name = flag(argv, "name") ?? (await ask("Product name", "App Core"));
  const org = (flag(argv, "org") ?? (await ask("Organization", "WORKSPACE"))).toUpperCase();
  const values: InitValues = {
    name,
    slug: flag(argv, "slug") ?? slugify(name),
    org,
    initials: (flag(argv, "initials") ?? (await ask("Initials", initialsOf(org)))).toUpperCase(),
    currency: (flag(argv, "currency") ?? (await ask("Base currency", "USD"))).toUpperCase(),
    version: flag(argv, "version") ?? "0.1.0",
  };

  console.log(`\nProject: ${values.name} (${values.slug}) — ${values.org} — ${values.currency}\n`);
  const changed = initProject(root, values, { git: !argv.includes("--no-git") });

  for (const entry of changed) {
    // Entries may carry their own marker (`+` created, `-` removed); files get `~`.
    console.log(`  ${/^[+~-] /.test(entry) ? entry : `~ ${entry}`}`);
  }
  console.log("\nNext: bun run gen module <id> — then bun run dev.");
}

if (import.meta.main) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
