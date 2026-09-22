import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  /** Title rendered in the header bar (uppercase, 10px). */
  title: ReactNode;
  /** Right-aligned header content (counters, totals, actions). */
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/** Bordered panel with a `--panel2` header bar; the base container of the UI. */
export function Panel({ title, actions, className, bodyClassName, children }: PanelProps) {
  return (
    <section
      className={cn("overflow-hidden rounded-[2px] border border-border bg-panel", className)}
    >
      <header className="flex h-5 min-h-5 items-center justify-between gap-2 border-b border-border bg-panel2 px-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-dim">
        <span className="truncate">{title}</span>
        {actions ? (
          <span className="shrink-0 font-mono text-[9px] normal-case tracking-normal">
            {actions}
          </span>
        ) : null}
      </header>
      <div className={cn("bg-panel", bodyClassName)}>{children}</div>
    </section>
  );
}
