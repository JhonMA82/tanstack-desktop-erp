import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExpensesHistogram } from "@/components/dashboard/ExpensesHistogram";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RevenueWaveform } from "@/components/dashboard/RevenueWaveform";
import { useShell } from "@/components/layout/shell-context";
import { dashboardQueryOptions } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard")({
  // Awaited before the route renders: the page paints complete and the router's
  // intent preload actually warms the cache. Errors land in `ModuleError`.
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQueryOptions),
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = useShell();
  const { data } = useSuspenseQuery(dashboardQueryOptions);

  return (
    <div className="flex flex-col gap-2 p-2">
      <MetricsGrid metrics={data.metrics} footer={`${period} • ${data.currency}`} />
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.4fr_1fr]">
        <RevenueWaveform series={data.revenue} period={period} />
        <ExpensesHistogram bars={data.histogram.bars} breakdown={data.histogram.breakdown} />
      </div>
      <RecentTransactions transactions={data.transactions.slice(0, 6)} total={data.total} />
    </div>
  );
}
