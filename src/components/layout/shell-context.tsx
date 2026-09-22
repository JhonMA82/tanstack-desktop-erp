import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ModuleDef } from "@/lib/modules";
import { moduleByPath } from "@/lib/modules";

export type ThemeMode = "dark" | "light";

/** Ribbon view-mode values used by the source UI's shared view state. */
export type RibbonView = "LEDGER" | "GRID" | "STATEMENTS";

/** Reporting-period values cycled by the ribbon period dropdown. */
export const PERIODS = ["7D", "30D", "90D", "FY"] as const;

interface ShellContextValue {
  /** Current theme; persisted in `localStorage` under `erp-theme`. */
  theme: ThemeMode;
  /** Flips between dark and light themes. */
  toggleTheme: () => void;
  /** Whether the Ctrl+K command palette is open. */
  paletteOpen: boolean;
  /** Opens or closes the command palette. */
  setPaletteOpen: (open: boolean) => void;
  /** Module derived from the current pathname. */
  activeModule: ModuleDef;
  /** Whether the ribbon row is collapsed (28px hint bar). */
  ribbonCollapsed: boolean;
  /** Collapses or expands the ribbon. */
  toggleRibbon: () => void;
  /** Reporting period shared by ribbon, viewport header, status bar and dashboard. */
  period: string;
  /** Advances the period (7D → 30D → 90D → FY → 7D). */
  cyclePeriod: () => void;
  /** Ribbon view mode shared by ribbon, viewport header and status bar. */
  view: RibbonView;
  /** Updates the ribbon view mode. */
  setView: (view: RibbonView) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

const THEME_STORAGE_KEY = "erp-theme";

/** Provides theme, palette, ribbon and view state plus the active module. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
  const [period, setPeriod] = useState<string>("30D");
  const [view, setView] = useState<RibbonView>("LEDGER");
  const activeModule = moduleByPath(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const cyclePeriod = useCallback(() => {
    setPeriod((current) => {
      const index = PERIODS.indexOf(current as (typeof PERIODS)[number]);
      return PERIODS[(index + 1) % PERIODS.length];
    });
  }, []);

  const toggleRibbon = useCallback(() => setRibbonCollapsed((collapsed) => !collapsed), []);

  const value = useMemo<ShellContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      paletteOpen,
      setPaletteOpen,
      activeModule,
      ribbonCollapsed,
      toggleRibbon,
      period,
      cyclePeriod,
      view,
      setView,
    }),
    [theme, paletteOpen, activeModule, ribbonCollapsed, toggleRibbon, period, cyclePeriod, view],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

/** Reads the shell context; throws when used outside of `ShellProvider`. */
export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return ctx;
}
