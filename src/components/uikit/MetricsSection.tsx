import { useQuery } from "@tanstack/react-query";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { Panel } from "@/components/ui/Panel";
import { dashboardQueryOptions } from "@/data/dashboard";

/** Metric cards reusing the Dashboard query fixture (same widgets, same data path). */
export function MetricsSection() {
  const { data } = useQuery(dashboardQueryOptions);

  return (
    <Panel title="Metrics" actions={data ? `${data.period} • ${data.currency}` : "…"}>
      {!data ? (
        <p className="p-3 font-mono text-[11px] text-ink-dim">LOADING METRICS…</p>
      ) : (
        <div className="p-2">
          <MetricsGrid
            metrics={data.metrics.slice(0, 2)}
            footer={`${data.period} • ${data.currency}`}
          />
        </div>
      )}
    </Panel>
  );
}
