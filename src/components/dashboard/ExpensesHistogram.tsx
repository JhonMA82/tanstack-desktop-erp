import type { HistogramBar } from "@/data/dashboard";

export interface ExpensesHistogramProps {
  bars: HistogramBar[];
  /** Allocation breakdown line rendered under the chart. */
  breakdown: string;
}

const BAR_WIDTH = 32;
const BAR_STEP = 48;
const BASELINE_Y = 120;
const FIRST_X = 20;

/** Bar chart of expenses per account with the allocation breakdown footer; colors are theme tokens. */
export function ExpensesHistogram({ bars, breakdown }: ExpensesHistogramProps) {
  return (
    <section
      className="flex flex-col rounded-[2px] border border-border bg-bg p-2"
      aria-label="Expenses histogram"
    >
      <header className="mb-2 font-mono text-[9px] text-ink-dim">
        EXPENSES HISTOGRAM • BY ACCOUNT
      </header>
      <svg
        width="100%"
        height="140"
        viewBox="0 0 320 140"
        preserveAspectRatio="none"
        className="block"
      >
        <title>Expenses histogram by account</title>
        {bars.map((bar, index) => (
          <g key={bar.account}>
            <rect
              x={FIRST_X + index * BAR_STEP}
              y={BASELINE_Y - bar.height}
              width={BAR_WIDTH}
              height={bar.height}
              fill={bar.color}
              rx="1"
            />
            <text
              x={FIRST_X + index * BAR_STEP + BAR_WIDTH / 2}
              y={132}
              textAnchor="middle"
              fontSize="8"
              fill="var(--text-dim)"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {bar.account}
            </text>
          </g>
        ))}
      </svg>
      <footer className="mt-2 font-mono text-[8px] text-ink-dim">{breakdown}</footer>
    </section>
  );
}
