import type { ReactNode } from "react";
import { useEffect } from "react";
import { ToastProvider } from "@/components/feedback/toaster";
import { CommandPalette } from "@/components/palette/CommandPalette";
import { ModuleMenu } from "./ModuleMenu";
import { Outliner } from "./Outliner";
import { PropertiesPanel } from "./PropertiesPanel";
import { StatusBar } from "./StatusBar";
import { ShellProvider, useShell } from "./shell-context";
import { ViewportHeader } from "./ViewportHeader";

export interface AppShellProps {
  /** Routed content (the root route passes `<Outlet />`). */
  children?: ReactNode;
}

/** Full application frame: menu, outliner, viewport, inspector, status bar, palette. */
export function AppShell({ children }: AppShellProps) {
  return (
    <ToastProvider>
      <ShellProvider>
        <ShellFrame>{children}</ShellFrame>
      </ShellProvider>
    </ToastProvider>
  );
}

function ShellFrame({ children }: AppShellProps) {
  const { paletteOpen, setPaletteOpen } = useShell();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, setPaletteOpen]);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-bg text-ink">
      <ModuleMenu />
      <div className="flex min-h-0 flex-1">
        <Outliner />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-panel">
          <ViewportHeader />
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </main>
        <PropertiesPanel />
      </div>
      <StatusBar />
      {paletteOpen ? <CommandPalette /> : null}
    </div>
  );
}
