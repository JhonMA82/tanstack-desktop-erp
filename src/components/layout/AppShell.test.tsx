import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { AppShell } from "./AppShell";
import { Outliner } from "./Outliner";
import { PropertiesPanel } from "./PropertiesPanel";
import { ShellProvider } from "./shell-context";

// `bun test` has no DOM; ShellProvider reads `window.localStorage` during its
// initial state. Only the storage the shell touches is stubbed here.
if (!("window" in globalThis)) {
  Object.defineProperty(globalThis, "window", {
    value: {
      localStorage: {
        getItem: () => null,
        setItem: () => undefined,
      },
    },
  });
}

/** Renders an element inside a real (memory-history) router through React's SSR pipeline. */
async function renderInRouter(element: ReactNode): Promise<string> {
  const rootRoute = createRootRoute({ component: () => element });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}

/**
 * SSR smoke for the collapsible side panels: a broken hook, missing provider or
 * bad import fails here even when typecheck is green, and both the expanded
 * chrome and the collapsed rails are checked for the handles that drive them.
 */
describe("collapsible side panels", () => {
  test("shell renders both panels expanded with their collapse buttons", async () => {
    const html = await renderInRouter(
      <QueryClientProvider client={new QueryClient()}>
        <AppShell />
      </QueryClientProvider>,
    );

    expect(html).toContain('aria-label="Collapse Outliner"');
    expect(html).toContain('aria-label="Collapse Properties"');
    // Left panel content is present while expanded.
    expect(html).toContain("Favorites");
    // Right panel content is present while expanded.
    expect(html).toContain("COMPANY");
  });

  test("left panel collapses to a rail that can expand it again", async () => {
    const html = await renderInRouter(
      <ShellProvider>
        <Outliner collapsed title="Outliner" side="left" onToggle={() => undefined} />
      </ShellProvider>,
    );

    expect(html).toContain('aria-label="Outliner (collapsed)"');
    expect(html).toContain('aria-label="Expand Outliner"');
    expect(html).not.toContain('aria-label="Collapse Outliner"');
  });

  test("right panel collapses to a rail that can expand it again", async () => {
    const html = await renderInRouter(
      <ShellProvider>
        <PropertiesPanel collapsed title="Properties" side="right" onToggle={() => undefined} />
      </ShellProvider>,
    );

    expect(html).toContain('aria-label="Properties (collapsed)"');
    expect(html).toContain('aria-label="Expand Properties"');
    expect(html).not.toContain('aria-label="Collapse Properties"');
  });
});
