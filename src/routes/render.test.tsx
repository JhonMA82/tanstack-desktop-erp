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

/**
 * End-to-end smoke of the whole wiring: real route tree, real loader, real query
 * cache and the real shell. A missing context, an un-awaited loader or a broken
 * provider shows up here even when typecheck is green.
 */
describe("app render", () => {
  test("the dashboard renders its data inside the full shell", async () => {
    const queryClient = new QueryClient();
    const router = createRouter({
      routeTree,
      context: { queryClient },
      history: createMemoryHistory({ initialEntries: ["/dashboard"] }),
    });
    await router.load();

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    // Shell chrome.
    expect(html).toContain("Outliner");
    expect(html).toContain("Properties");
    // Brand comes from the app config, not from the layout.
    expect(html).toContain(APP.name);
    expect(html).toContain(APP.organization);
    // Module tab for the active route.
    expect(html).toContain("DASHBOARD");
    // Data rendered by the dashboard widgets, not its loading panel.
    expect(html).toContain("CASH");
    expect(html).toContain("$128,400");
    expect(html).not.toContain("LOADING DASHBOARD");
    // Ribbon submenu trigger (period pill) is present and collapsed.
    expect(html).toContain('aria-label="Period options"');
    expect(html).toContain('aria-expanded="false"');
  });

  test("accounting wires the ribbon submenus to the icon chevrons", async () => {
    const queryClient = new QueryClient();
    const router = createRouter({
      routeTree,
      context: { queryClient },
      history: createMemoryHistory({ initialEntries: ["/accounting"] }),
    });
    await router.load();

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );

    // Chevron triggers sit on the icon box of the buttons that own variants.
    expect(html).toContain('aria-label="New Invoice options"');
    expect(html).toContain('aria-label="Grid View options"');
    // The document variants still exist as small buttons next to the large one.
    expect(html).toContain("New Bill");
    expect(html).toContain("Credit Note");
  });
});
