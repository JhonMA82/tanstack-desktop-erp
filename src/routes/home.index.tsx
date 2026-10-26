import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ActivityTable } from "@/components/home/ActivityTable";
import { MetricsRow } from "@/components/home/MetricsRow";
import { overviewQueryOptions } from "@/data/overview";

/**
 * Reference module of the base: a resource in `src/data`, presentational widgets
 * in `src/components/home` and a route that awaits its data before painting.
 * Copy this shape for every new module (`bun run gen module <id>` does it for you).
 */
export const Route = createFileRoute("/home/")({
  // Awaited before the route renders: the page paints complete and the router's
  // intent preload actually warms the cache. Errors land in `ModuleError`.
  loader: ({ context }) => context.queryClient.ensureQueryData(overviewQueryOptions),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(overviewQueryOptions);

  return (
    <div className="flex flex-col gap-2 p-2">
      <MetricsRow metrics={data.metrics} footer="ALL TIME" />
      <ActivityTable activity={data.activity} total={data.totalLabel} />
    </div>
  );
}
