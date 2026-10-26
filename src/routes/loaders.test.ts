import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { overviewQueryOptions } from "@/data/overview";
import { routeTree } from "@/routeTree.gen";

/**
 * Loaders read the query client from the router context, so this exercises the
 * whole wiring (`main.tsx` → `__root.tsx` → route) without a DOM: if the context
 * is missing or a loader is not awaited, the cache stays empty.
 */
async function load(queryClient: QueryClient, path: string): Promise<void> {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
}

describe("route loaders", () => {
  test("the home loader primes the query cache before the route renders", async () => {
    const queryClient = new QueryClient();

    await load(queryClient, "/home");

    expect(queryClient.getQueryData(overviewQueryOptions.queryKey)).toBeDefined();
  });

  test("a nested page loads without a data resource of its own", async () => {
    const queryClient = new QueryClient();

    await load(queryClient, "/settings/preferences");

    expect(queryClient.getQueryData(overviewQueryOptions.queryKey)).toBeUndefined();
  });
});
