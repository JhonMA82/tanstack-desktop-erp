import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ModuleDef } from "@/lib/modules";
import { moduleByPath } from "@/lib/modules";

export type ThemeMode = "dark" | "light";

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
}

const ShellContext = createContext<ShellContextValue | null>(null);

const THEME_STORAGE_KEY = "erp-theme";

/** Provides theme, command-palette state and the active module to the whole shell. */
export function ShellProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const activeModule = moduleByPath(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ShellContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      paletteOpen,
      setPaletteOpen,
      activeModule,
    }),
    [theme, paletteOpen, activeModule],
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
