import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { ShellError } from "@/components/feedback/RouteError";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";

/** Router-wide context: every route `loader` receives it (see `src/main.tsx`). */
export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  // Only reached when the shell fails: a module error is caught one level down.
  errorComponent: ShellError,
  notFoundComponent: NotFoundComponent,
});

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function NotFoundComponent() {
  return (
    <div className="p-2">
      <Panel title="ERROR • 404">
        <p className="p-4 font-mono text-[11px] text-ink-dim">ROUTE NOT FOUND</p>
      </Panel>
    </div>
  );
}
