import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Semantic state of a badge. The tone is a design token, so the badge works in
 * both themes and stays independent of any domain vocabulary.
 */
export type StatusTone = "neutral" | "positive" | "warning" | "danger";

/** Accent color per tone, using design system tokens. */
const TONE_COLORS: Record<StatusTone, string> = {
  neutral: "var(--text-dim)",
  positive: "var(--green)",
  warning: "var(--orange)",
  danger: "var(--red)",
};

export interface StatusBadgeProps {
  /** Semantic meaning of the label; the color follows the tone, not the text. */
  tone: StatusTone;
  className?: string;
  children: ReactNode;
}

/** Status chip with a colored border and a 2px accent edge. */
export function StatusBadge({ tone, className, children }: StatusBadgeProps) {
  const color = TONE_COLORS[tone];
  return (
    <span
      className={cn(
        "inline-flex h-4 items-center rounded-[2px] border bg-transparent px-[5px] font-mono text-[9px] font-bold uppercase tracking-[0.06em]",
        className,
      )}
      style={{ borderColor: color, color, borderLeftWidth: 2 }}
    >
      {children}
    </span>
  );
}
