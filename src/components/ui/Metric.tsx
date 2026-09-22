export interface MetricProps {
  /** Metric key (e.g. `CASH`, `RECEIVABLES`). */
  label: string;
  /** Big monospace value (e.g. `$128,400`). */
  value: string;
  /** Short delta chip (e.g. `+8.2%` or `RUN OCT`). */
  delta: string;
  /** CSS color for the delta chip and sparkline (e.g. `var(--green)`). */
  accent: string;
  /** Sparkline samples in the 0–20 range (higher reads as a higher point). */
  spark: number[];
  /** Small footer line (e.g. `30D • USD`). */
  footer?: string;
}

/** KPI card with label, delta chip, value, sparkline and footer (original `.metric`). */
export function Metric({ label, value, delta, accent, spark, footer }: MetricProps) {
  const divisor = Math.max(spark.length - 1, 1);
  const points = spark
    .map((sample, index) => `${(index / divisor) * 100},${20 - sample}`)
    .join(" ");
  const lastSample = spark.at(-1) ?? 0;

  return (
    <article className="relative flex flex-col gap-1 overflow-hidden border border-border bg-panel p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-ink-dim">
          {label}
        </span>
        <span
          className="rounded-[2px] border border-border bg-panel2 px-1 py-px font-mono text-[9px]"
          style={{ color: accent }}
        >
          {delta}
        </span>
      </div>
      <div className="font-mono text-[18px] font-bold leading-none text-ink-bright">{value}</div>
      <svg
        className="h-5 w-full"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline fill="none" stroke={accent} strokeWidth="1.2" points={points} />
        <circle cx={100} cy={20 - lastSample} r="1.5" fill={accent} />
      </svg>
      {footer ? <div className="font-mono text-[8px] text-ink-dim">{footer}</div> : null}
    </article>
  );
}
