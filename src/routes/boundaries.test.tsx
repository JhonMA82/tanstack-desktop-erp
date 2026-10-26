import { describe, expect, spyOn, test } from "bun:test";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { ModuleError, ShellError } from "@/components/feedback/RouteError";

/**
 * Mirrors the real tree: the shell lives in the root route and module routes
 * mount inside its `<Outlet>`, with `ModuleError` as their boundary and
 * `ShellError` reserved for the root.
 */
function buildTree(moduleThrows: boolean) {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        SHELL_CONTENT
        <Outlet />
      </div>
    ),
    errorComponent: ShellError,
  });
  const moduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => {
      if (moduleThrows) {
        throw new Error("module exploded");
      }
      return <div>MODULE_CONTENT</div>;
    },
    errorComponent: ModuleError,
  });
  return rootRoute.addChildren([moduleRoute]);
}

async function render(moduleThrows: boolean): Promise<string> {
  const router = createRouter({
    routeTree: buildTree(moduleThrows),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}

describe("route error boundaries", () => {
  test("a healthy module renders inside the shell", async () => {
    const html = await render(false);

    expect(html).toContain("SHELL_CONTENT");
    expect(html).toContain("MODULE_CONTENT");
  });

  test("a crashed module keeps the shell and never triggers the app-level fallback", async () => {
    // React reports the caught error; the assertion is about what survives.
    const silence = spyOn(console, "error").mockImplementation(() => {});
    try {
      const html = await render(true);

      expect(html).toContain("SHELL_CONTENT");
      expect(html).not.toContain("APPLICATION • ERROR");
    } finally {
      silence.mockRestore();
    }
  });
});
