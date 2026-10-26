import { Metric } from "@/components/ui/Metric";
import type { MetricTone, OverviewMetric } from "@/data/overview";

/**
 * Tone is semantic in the data (`positive` / `warning` / `neutral`) and becomes a
 * design token here, so swapping the palette never means touching a fixture.
 */
const TONE_COLORS: Record<MetricTone, string> = {
  positive: "var(--green)",
  warning: "var(--orange)",
  neutral: "var(--blue)",
};

export interface MetricsRowProps {
  metrics: OverviewMetric[];
  /** Footer line shared by every metric (e.g. `ALL TIME`). */
  footer: string;
}

/** KPI row of the reference module: one `Metric` per entry, hairline separators. */
export function MetricsRow({ metrics, footer }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-border bg-border sm:grid-cols-2">
      {metrics.map((metric) => (
        <Metric
          key={metric.id}
          label={metric.label}
          value={metric.value}
          delta={metric.delta}
          accent={TONE_COLORS[metric.tone]}
          spark={metric.spark}
          footer={footer}
        />
      ))}
    </div>
  );
}
