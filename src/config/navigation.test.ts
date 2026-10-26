import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import type { ActionBehavior } from "./navigation";
import { DEFAULT_MODULE_PATH, MODULES, PAGES, pagesOf } from "./navigation";

/**
 * Guardrail between the navigation registry and the generated route tree. The
 * `ModulePath` type already rejects a path that does not exist at compile time;
 * this catches the other direction — a route nobody registered, a page that
 * escaped its module, a menu pointing at a removed page — which typecheck can't.
 */
function routePaths(): string[] {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return Object.keys(router.routesByPath);
}

/** `/` only redirects to the default module, so it is the sole unregistered route. */
const NON_MODULE_ROUTES = new Set(["/"]);

/** Detail/edit routes take a route param, so they are not registry destinations. */
const isDynamic = (path: string) => path.includes("$");

function registeredPaths(): string[] {
  return [...MODULES.map((module) => module.path), ...PAGES.map((page) => page.path)];
}

function menuBehaviors(): ActionBehavior[] {
  return MODULES.flatMap((module) =>
    (module.ribbon ?? []).flatMap((group) =>
      group.actions.flatMap((action) => [action, ...(action.menu ?? [])]),
    ),
  );
}

describe("navigation registry", () => {
  test("keeps module ids unique", () => {
    const ids = MODULES.map((module) => module.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  test("keeps page ids unique inside their module", () => {
    for (const module of MODULES) {
      const ids = pagesOf(module.id).map((page) => page.id);
      expect({ module: module.id, duplicated: ids.length !== new Set(ids).size }).toEqual({
        module: module.id,
        duplicated: false,
      });
    }
  });

  test("assigns every page to an existing module", () => {
    const ids = new Set(MODULES.map((module) => module.id));
    expect(PAGES.filter((page) => !ids.has(page.moduleId)).map((page) => page.id)).toEqual([]);
  });

  test("keeps every registered path unique", () => {
    const paths = registeredPaths();
    expect(paths).toEqual([...new Set(paths)]);
  });

  test("registers only paths the router resolves", () => {
    const known = new Set(routePaths());
    const unknown = registeredPaths().filter((path) => !known.has(path));
    expect(unknown).toEqual([]);
  });

  test("has a registry entry for every static route in the tree", () => {
    const registered = new Set(registeredPaths());
    const orphans = routePaths().filter(
      (path) => !NON_MODULE_ROUTES.has(path) && !isDynamic(path) && !registered.has(path),
    );
    expect(orphans).toEqual([]);
  });

  test("nests every dynamic route under a registered module", () => {
    const modulePaths = MODULES.map((module) => module.path);
    const escaped = routePaths()
      .filter(isDynamic)
      .filter((path) => !modulePaths.some((modulePath) => path.startsWith(`${modulePath}/`)));
    expect(escaped).toEqual([]);
  });

  test("nests every page under its module", () => {
    const escaped = PAGES.filter((page) => {
      const module = MODULES.find((candidate) => candidate.id === page.moduleId);
      return !module || !page.path.startsWith(`${module.path}/`);
    }).map((page) => `${page.moduleId}: ${page.path}`);
    expect(escaped).toEqual([]);
  });

  test("points every ribbon menu target at a registered path", () => {
    const registered = new Set(registeredPaths());
    const targets = menuBehaviors().flatMap((behavior) => (behavior.to ? [behavior.to] : []));
    expect(targets.filter((to) => !registered.has(to))).toEqual([]);
  });

  test("opens on the first module", () => {
    expect(MODULES[0]?.path).toBe(DEFAULT_MODULE_PATH);
  });
});
