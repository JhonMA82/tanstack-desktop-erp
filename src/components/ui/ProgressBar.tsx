import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  /** Completion in 0–100 (ignored when `indeterminate`). */
  value?: number;
  /** Renders the source status-bar sweeping animation instead of a value. */
  indeterminate?: boolean;
  className?: string;
}

/** 2px progress track; `indeterminate` reuses the status bar `erp-prog` sweep. */
export function ProgressBar({ value = 0, indeterminate = false, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn("h-0.5 w-full overflow-hidden bg-border", className)}
    >
      <div
        className={cn(
          "h-full bg-orange",
          indeterminate ? "w-[42%] animate-[erp-prog_2s_linear_infinite]" : "",
        )}
        style={indeterminate ? undefined : { width: `${clamped}%` }}
      />
    </div>
  );
}
