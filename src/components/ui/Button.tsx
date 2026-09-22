import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant (defaults to `default`, the Blender panel button). */
  variant?: ButtonVariant;
  /** Control size (`md` = 22px, `sm` = 20px, matching the original UI). */
  size?: ButtonSize;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: "bg-panel3 text-ink hover:bg-panel2 hover:text-ink-bright",
  primary: "border-orange bg-orange text-black hover:brightness-110",
  ghost: "border-transparent bg-transparent text-ink-dim hover:text-ink-bright",
  danger: "border-red bg-transparent text-red hover:bg-red/10",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-5 px-1.5 text-[9px]",
  md: "h-[22px] px-2.5 text-[10px]",
};

/** Compact Blender-style button used across panels, modals and toolbars. */
export function Button({
  variant = "default",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-[2px] border font-semibold uppercase tracking-[0.06em] transition-colors",
        "outline-none focus-visible:ring-1 focus-visible:ring-orange disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
