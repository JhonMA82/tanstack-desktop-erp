import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  /** Right-aligned controls (e.g. an "Add" button) rendered opposite the title. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Uppercase mono heading used by the invoice form sections, with an optional
 * action slot — the in-panel counterpart of the DataTable header bar.
 */
export function SectionHeading({ action, children, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink-dim">
        {children}
      </h2>
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  );
}
