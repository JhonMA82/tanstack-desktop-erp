import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "default" | "green" | "orange" | "red" | "blue";

export interface BadgeProps {
  /** Accent color of the badge border and text. */
  tone?: BadgeTone;
  className?: string;
  children?: ReactNode;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  default: "border-border text-ink-dim",
  green: "border-green text-green",
  orange: "border-orange text-orange",
  red: "border-red text-red",
  blue: "border-blue text-blue",
};

/** Small uppercase chip matching the original `.badge` style (JetBrains Mono, 9px). */
export function Badge({ tone = "default", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-4 items-center rounded-[2px] border px-[5px] font-mono text-[9px] font-bold uppercase tracking-[0.06em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
