import { Metric } from "@/components/ui/Metric";
import type { MetricDatum } from "@/data/dashboard";

export interface MetricsGridProps {
  metrics: MetricDatum[];
  /** Footer line shared by every metric (e.g. `30D • USD`). */
  footer: string;
}

/** Four-column KPI grid with hairline separators (original dashboard metrics row). */
export function MetricsGrid({ metrics, footer }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Metric
          key={metric.label}
          label={metric.label}
          value={metric.value}
          delta={metric.delta}
          accent={metric.accent}
          spark={metric.spark}
          footer={footer}
        />
      ))}
    </div>
  );
}
