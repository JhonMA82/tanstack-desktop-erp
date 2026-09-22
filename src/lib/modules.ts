/**
 * Single source of truth for application modules: the top menu, outliner,
 * command palette and placeholder routes all read from this file.
 * Add a module here first, then create its route (see README).
 */
export type ModulePath =
  | "/dashboard"
  | "/accounting"
  | "/hrm"
  | "/payroll"
  | "/inventory"
  | "/reports"
  | "/settings";

export interface ModuleDef {
  /** Stable identifier; matches the route file name under `src/routes`. */
  id: string;
  /** Uppercase label rendered in menus, outliner and palette. */
  label: string;
  /** Small counter rendered next to the label (e.g. `248`, `LIVE`, `—`). */
  count: string;
  /** Absolute route path of the module. */
  path: ModulePath;
  /** One-line description used by the inspector and placeholder pages. */
  description: string;
}

export interface FavoriteDef {
  /** Shortcut label shown in the outliner favorites section. */
  label: string;
  /** Route the shortcut points to. */
  path: ModulePath;
}

/** All navigable modules, in menu order. */
export const MODULES: ModuleDef[] = [
  {
    id: "dashboard",
    label: "DASHBOARD",
    count: "LIVE",
    path: "/dashboard",
    description: "Cash position, receivables, payables and the revenue waveform at a glance.",
  },
  {
    id: "accounting",
    label: "ACCOUNTING",
    count: "248",
    path: "/accounting",
    description: "Chart of accounts, ledger, invoices and double-entry journal entries.",
  },
  {
    id: "hrm",
    label: "HRM",
    count: "42",
    path: "/hrm",
    description: "Employees, attendance and leave requests.",
  },
  {
    id: "payroll",
    label: "PAYROLL",
    count: "$24K",
    path: "/payroll",
    description: "Payroll runs, earnings, deductions and payslips.",
  },
  {
    id: "inventory",
    label: "INVENTORY",
    count: "1.2K",
    path: "/inventory",
    description: "Stock items, SKUs and movements.",
  },
  {
    id: "reports",
    label: "REPORTS",
    count: "12",
    path: "/reports",
    description: "Statements, exports and scheduled deliveries.",
  },
  {
    id: "settings",
    label: "SETTINGS",
    count: "—",
    path: "/settings",
    description: "Company profile, security and preferences.",
  },
];

/** Outliner shortcuts (Blender-style favorites). */
export const FAVORITES: FavoriteDef[] = [
  { label: "Cash Flow", path: "/dashboard" },
  { label: "Receivables $42K", path: "/accounting" },
  { label: "Payroll Run OCT", path: "/payroll" },
  { label: "Leave Requests 3", path: "/hrm" },
];

/** Resolves a module from a pathname, falling back to the dashboard. */
export function moduleByPath(pathname: string): ModuleDef {
  return MODULES.find((module) => module.path === pathname) ?? MODULES[0];
}

/** Resolves a module by its stable id, throwing when it does not exist. */
export function moduleById(id: string): ModuleDef {
  const found = MODULES.find((module) => module.id === id);
  if (!found) {
    throw new Error(`Unknown module id: ${id}`);
  }
  return found;
}
