import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ModuleDef, PageDef } from "@/config/navigation";
import { moduleByPath, pageByPath } from "@/config/navigation";

export type ThemeMode = "dark" | "light";

interface ShellContextValue {
  /** Current theme; persisted in `localStorage` under `app-theme`. */
  theme: ThemeMode;
  /** Flips between dark and light themes. */
  toggleTheme: () => void;
  /** Whether the Ctrl+K command palette is open. */
  paletteOpen: boolean;
  /** Opens or closes the command palette. */
  setPaletteOpen: (open: boolean) => void;
  /** Module derived from the current pathname (a nested page belongs to its module). */
  activeModule: ModuleDef;
  /** Nested page of the active module, when the pathname matches one. */
  activePage?: PageDef;
  /** Whether the ribbon row is collapsed (28px hint bar). */
  ribbonCollapsed: boolean;
  /** Collapses or expands the ribbon. */
  toggleRibbon: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

const THEME_STORAGE_KEY = "app-theme";

/** Provides theme, palette and ribbon state plus the active module and page. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
  const activeModule = moduleByPath(pathname);
  const activePage = pageByPath(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleRibbon = useCallback(() => setRibbonCollapsed((collapsed) => !collapsed), []);

  const value = useMemo<ShellContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      paletteOpen,
      setPaletteOpen,
      activeModule,
      activePage,
      ribbonCollapsed,
      toggleRibbon,
    }),
    [theme, paletteOpen, activeModule, activePage, ribbonCollapsed, toggleRibbon],
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
