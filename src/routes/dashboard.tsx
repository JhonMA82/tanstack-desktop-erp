import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ExpensesHistogram } from "@/components/dashboard/ExpensesHistogram";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { RevenueWaveform } from "@/components/dashboard/RevenueWaveform";
import { useShell } from "@/components/layout/shell-context";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { dashboardQueryOptions } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { period } = useShell();
  const { data, isPending, isError, error, refetch } = useQuery(dashboardQueryOptions);

  if (isPending) {
    return <DashboardStatus title="LOADING DASHBOARD…" />;
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="p-2">
        <Panel title="DASHBOARD • ERROR">
          <div className="flex items-center gap-3 p-4">
            <span className="font-mono text-[11px] text-red">{message}</span>
            <Button onClick={() => void refetch()}>RETRY</Button>
          </div>
        </Panel>
      </div>
    );
  }

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

function DashboardStatus({ title }: { title: string }) {
  return (
    <div className="p-2">
      <Panel title="DASHBOARD">
        <p className="p-4 font-mono text-[11px] text-ink-dim">{title}</p>
      </Panel>
    </div>
  );
}
