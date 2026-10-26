import type { RevenueSeries } from "@/data/dashboard";

export interface RevenueWaveformProps {
  series: RevenueSeries;
  /** Reporting period shown in the header (e.g. `30D`). */
  period: string;
}

const GRID_LINES = [10, 38, 66, 94, 122];

/** Oscilloscope-style revenue chart with a dashed baseline; colors come from theme tokens. */
export function RevenueWaveform({ series, period }: RevenueWaveformProps) {
  return (
    <section
      className="flex flex-col rounded-[2px] border border-border bg-bg p-2"
      aria-label="Revenue waveform"
    >
      <header className="mb-2 flex justify-between font-mono text-[9px] text-ink-dim">
        <span>REVENUE WAVEFORM • {period} • REC 709</span>
        <span style={{ color: "var(--orange)" }}>● LIVE</span>
      </header>
      <svg
        width="100%"
        height="140"
        viewBox="0 0 500 140"
        preserveAspectRatio="none"
        className="block"
      >
        <title>Revenue trend with baseline comparison</title>
        <g stroke="var(--border)" strokeWidth="0.5">
          {GRID_LINES.map((y) => (
            <line key={y} x1="40" y1={y} x2="490" y2={y} />
          ))}
        </g>
        <polyline fill="none" stroke="var(--orange)" strokeWidth="1.2" points={series.trend} />
        <polyline
          fill="none"
          stroke="var(--borderL)"
          strokeWidth="1"
          strokeDasharray="3 3"
          points={series.baseline}
        />
      </svg>
      <footer className="mt-2 flex gap-3 font-mono text-[9px]">
        <span className="text-ink-dim">MIN {series.min}</span>
        <span className="text-ink-dim">MAX {series.max}</span>
        <span className="ml-auto text-ink">
          AVG {series.average} • {series.yoy}
        </span>
      </footer>
    </section>
  );
}
