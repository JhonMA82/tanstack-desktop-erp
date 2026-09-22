import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Native select styled like the source `.select` (24px, mono 11, chevron overlay). */
export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative flex">
      <select
        className={cn(
          "h-6 cursor-pointer appearance-none rounded-[2px] border border-border bg-panel3 px-2 pr-6 font-mono text-[11px] text-ink outline-none",
          "hover:border-border-l focus:border-orange disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-dim"
        aria-hidden="true"
      >
        ▾
      </span>
    </span>
  );
}
