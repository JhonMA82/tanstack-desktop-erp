import type { ToastInput } from "@/components/feedback/toaster";
import type { IconName } from "@/lib/icons";
import type { FileRoutesByTo } from "@/routeTree.gen";

/**
 * Every route path known to the router, derived from the generated tree. A
 * registry entry that points at a route which does not exist fails `tsc`, so a
 * stale menu can not reach the browser.
 */
export type ModulePath = keyof FileRoutesByTo;

/** Shell-level commands a ribbon action can run without owning module state. */
export type ShellCommand = "toggle-theme" | "toggle-ribbon" | "open-palette";

/** What activating an entry does. Declarative on purpose: the registry holds data, never closures. */
export interface ActionBehavior {
  /** Navigates to a route of the app. */
  to?: ModulePath;
  /** Pushes a toast (the template's placeholder for a real command). */
  notify?: ToastInput;
  /** Runs a shell command. */
  command?: ShellCommand;
}

/** One row of a dropdown menu opened from the ribbon. */
export interface MenuAction extends ActionBehavior {
  id: string;
  label: string;
  /** Leading icon of the row, rendered at 10px. */
  icon?: IconName;
}

/** One button of a ribbon group. */
export interface RibbonAction extends ActionBehavior {
  id: string;
  /** `large` is the 58px icon tile, `small` the 22px row. */
  size: "large" | "small";
  icon: IconName;
  /** Icon size in px; defaults to 14 on `large` buttons and 10 on `small` ones. */
  iconSize?: number;
  /** Large buttons split on `\n` into two lines; small buttons show it inline. */
  label: string;
  /** Orange primary state / destructive state. */
  tone?: "accent" | "danger";
  /** Variants of this action, rendered as a dropdown. */
  menu?: MenuAction[];
  /** 58px tall small button (the `ALL` filter shape). */
  tall?: boolean;
}

/** A labelled cluster of actions in the ribbon row. */
export interface RibbonGroup {
  label: string;
  /** `2` keeps a group with four or more small buttons inside the height budget. */
  columns?: 1 | 2;
  actions: RibbonAction[];
}

/** A nested route inside a module: the submenu entries of the app. */
export interface PageDef {
  id: string;
  /** Id of the module that owns this nested route. */
  moduleId: string;
  label: string;
  path: ModulePath;
  /**
   * Registered but not a navigation destination: forms, wizards and other routes
   * reached from a row or a button. Keeps the guardrail honest without putting
   * "New entry" in the outliner.
   */
  hidden?: boolean;
}

/** A top-level module: one tab, one ribbon and, optionally, nested pages. */
export interface ModuleDef {
  id: string;
  /** Uppercase label used by the tabs, the outliner and the palette. */
  label: string;
  /** Root route of the module (its index page). */
  path: ModulePath;
  /** Small counter rendered next to the label. */
  count: string;
  /** One-line description used by the inspector. */
  description: string;
  /** Groups of the ribbon. Without groups the 96px row is not rendered. */
  ribbon?: RibbonGroup[];
}

/**
 * Single source of truth of the application navigation: module tabs, ribbon
 * groups, outliner tree and command palette all read from this array.
 *
 * `bun run gen module|page` inserts entries at the `gen:modules` marker; the
 * router paths come from `routeTree.gen.ts`, so both must exist before typecheck
 * passes (the generator writes the route file first).
 */
export const MODULES: ModuleDef[] = [
  {
    id: "home",
    label: "HOME",
    path: "/home",
    count: "LIVE",
    description: "Reference module: a KPI row and the recent activity table, wired end to end.",
    ribbon: [
      {
        label: "Record",
        actions: [
          {
            id: "new-record",
            size: "large",
            icon: "plus",
            label: "New\nRecord",
            tone: "accent",
            notify: { kind: "INFO", title: "NEW RECORD", message: "Record composer — REC-1043" },
            menu: [
              {
                id: "new-task",
                label: "New Task",
                icon: "plus",
                notify: { kind: "INFO", title: "NEW TASK", message: "Task composer opened" },
              },
              {
                id: "new-note",
                label: "New Note",
                icon: "file",
                notify: { kind: "INFO", title: "NEW NOTE", message: "Note composer opened" },
              },
              {
                id: "import",
                label: "Import…",
                icon: "import",
                notify: { kind: "INFO", title: "IMPORT", message: "CSV import ready" },
              },
            ],
          },
          {
            id: "export",
            size: "large",
            icon: "export",
            label: "Export",
            notify: { kind: "SUCCESS", title: "EXPORTED", message: "overview.csv — 5 rows" },
          },
        ],
      },
      {
        label: "View",
        actions: [
          {
            id: "theme",
            size: "large",
            icon: "sun",
            label: "Theme",
            command: "toggle-theme",
          },
          {
            id: "palette",
            size: "large",
            icon: "search",
            label: "Palette",
            command: "open-palette",
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "SETTINGS",
    path: "/settings",
    count: "—",
    description: "Brand, company and appearance. Example of a module with a nested page.",
    ribbon: [
      {
        label: "Appearance",
        actions: [
          {
            id: "theme",
            size: "large",
            icon: "sun",
            label: "Theme",
            command: "toggle-theme",
          },
        ],
      },
    ],
  },
  {
    id: "entries",
    label: "ENTRIES",
    path: "/entries",
    count: "—",
    description: "Ledger entries: list, create, edit and archive, with a detail page per entry.",
    ribbon: [
      {
        label: "Entry",
        actions: [
          {
            id: "new-entry",
            size: "large",
            icon: "plus",
            label: "New\nEntry",
            tone: "accent",
            to: "/entries/new",
          },
          {
            id: "export",
            size: "large",
            icon: "export",
            label: "Export",
            notify: { kind: "SUCCESS", title: "EXPORTED", message: "entries.csv — 6 rows" },
          },
        ],
      },
    ],
  },
  // gen:modules
];

/**
 * Nested routes, one flat list so `bun run gen page` has a single insertion point.
 * The ribbon's `Pages` group, the outliner tree and the palette all read from here.
 */
export const PAGES: PageDef[] = [
  {
    id: "preferences",
    moduleId: "settings",
    label: "PREFERENCES",
    path: "/settings/preferences",
  },
  {
    id: "new",
    moduleId: "entries",
    label: "NEW ENTRY",
    path: "/entries/new",
    hidden: true,
  },
  // gen:pages
];

/**
 * Module the app opens on. `src/routes/index.tsx` redirects `/` here, and it must
 * be the first module so the `moduleByPath` fallback agrees with the landing page.
 */
export const DEFAULT_MODULE_PATH: ModulePath = "/home";

/** Resolves the module that owns `pathname` (a nested page belongs to its module). */
export function moduleByPath(pathname: string): ModuleDef {
  const found = MODULES.find(
    (module) => pathname === module.path || pathname.startsWith(`${module.path}/`),
  );
  return found ?? MODULES[0];
}

/** Nested pages owned by `moduleId`, in registry order (hidden ones included). */
export function pagesOf(moduleId: string): PageDef[] {
  return PAGES.filter((page) => page.moduleId === moduleId);
}

/** Pages a navigation surface should show: outliner tree, ribbon `Pages`, palette. */
export function visiblePagesOf(moduleId: string): PageDef[] {
  return pagesOf(moduleId).filter((page) => !page.hidden);
}

/** Resolves the nested page at `pathname`, when the pathnames matches one. */
export function pageByPath(pathname: string): PageDef | undefined {
  return PAGES.find((page) => page.path === pathname);
}
