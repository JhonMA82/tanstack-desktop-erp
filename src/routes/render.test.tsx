import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { APP } from "@/config/app";
import { routeTree } from "@/routeTree.gen";

// `bun test` has no DOM and `ShellProvider` reads `window.localStorage` on mount.
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

async function renderRoute(path: string): Promise<string> {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

/**
 * End-to-end smoke of the whole wiring: real route tree, real loader, real query
 * cache, real shell and the real navigation registry. A missing context, an
 * un-awaited loader, a broken provider or a registry entry that does not match
 * its route shows up here even when typecheck is green.
 */
describe("app render", () => {
  test("home renders its data inside the full shell", async () => {
    const html = await renderRoute("/home");

    // Shell chrome.
    expect(html).toContain("Outliner");
    expect(html).toContain("Properties");
    // Brand comes from the app config, not from the layout.
    expect(html).toContain(APP.name);
    expect(html).toContain(APP.organization);
    // Module tab for the active route, from the navigation registry.
    expect(html).toContain("HOME");
    // Data rendered by the reference widgets, not a loading panel.
    expect(html).toContain("ACTIVE RECORDS");
    expect(html).toContain("Onboarding checklist");
    expect(html).not.toContain("LOADING");
    // Ribbon submenu declared in the registry (chevron trigger, closed).
    expect(html).toContain('aria-label="New Record options"');
    expect(html).toContain('aria-expanded="false"');
  });

  test("a nested page renders inside its module and reaches every navigation surface", async () => {
    const html = await renderRoute("/settings/preferences");

    // The child page fills the parent layout's <Outlet/>.
    expect(html).toContain("STORAGE KEY: app-theme");
    // Module tabs and outliner both highlight the owning module; the page has its
    // own row in the outliner tree, derived from `module.pages`.
    expect(html).toContain("SETTINGS");
    expect(html).toContain("PREFERENCES");
    // Breadcrumb built by the shell from the active module and page.
    expect(html).toContain("SETTINGS / PREFERENCES // VIEWPORT");
    // The ribbon's derived `Pages` group exposes the nested route as a button.
    expect(html).toContain(">Pages<");
  });
});
