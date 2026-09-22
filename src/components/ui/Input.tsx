import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Text input styled like the original `.input` / `.filter-input` fields. */
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-6 rounded-[2px] border border-border bg-panel3 px-2 font-mono text-[11px] text-ink outline-none",
        "placeholder:text-ink-dim focus:border-orange",
        className,
      )}
      {...rest}
    />
  );
}
