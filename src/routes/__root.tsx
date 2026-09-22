import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Panel } from "@/components/ui/Panel";

export const Route = createRootRoute({
  component: RootLayout,
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
