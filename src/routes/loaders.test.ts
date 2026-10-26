import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { dashboardQueryOptions } from "@/data/dashboard";
import { invoiceQueryOptions } from "@/data/invoice";
import { routeTree } from "@/routeTree.gen";

/**
 * Loaders read the query client from the router context, so this exercises the
 * whole wiring (`main.tsx` → `__root.tsx` → route) without a DOM: if the
 * context is missing or a loader is not awaited, the cache stays empty.
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
  test("the dashboard loader primes the query cache before the route renders", async () => {
    const queryClient = new QueryClient();

    await load(queryClient, "/dashboard");

    expect(queryClient.getQueryData(dashboardQueryOptions.queryKey)).toBeDefined();
  });

  test("the invoice loader primes the query cache with the seed", async () => {
    const queryClient = new QueryClient();

    await load(queryClient, "/invoice");

    const seed = queryClient.getQueryData<{ defaults: { items: unknown[] } }>(
      invoiceQueryOptions.queryKey,
    );
    expect(seed?.defaults.items.length).toBeGreaterThan(0);
  });
});
