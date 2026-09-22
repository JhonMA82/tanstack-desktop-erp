import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Textarea styled like the source `.textarea` (80px min, mono 11, resizable). */
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full resize-y rounded-[2px] border border-border bg-panel3 p-2 font-mono text-[11px] text-ink outline-none",
        "placeholder:text-ink-dim focus:border-orange disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}
