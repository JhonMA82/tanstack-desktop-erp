import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface FieldProps {
  /** Strip label (uppercase mono, centered with top border — source `.field label`). */
  label: string;
  /** Associates the label with a control id when provided. */
  htmlFor?: string;
  /** Hint rendered under the control. */
  hint?: string;
  /** Error message rendered in red under the control (replaces the hint). */
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Form field wrapper: full-bleed label strip, control slot and hint/error line.
 * Designed for 8px-padded form bodies (matches the source `.form-sec-b`).
 */
export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-[3px]", className)}>
      <label
        htmlFor={htmlFor}
        className="-mx-2 flex h-4 items-center justify-center border-t border-border px-2 font-mono text-[9px] tracking-[0.08em] text-ink-dim uppercase"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-[9px] text-red">{error}</p>
      ) : hint ? (
        <p className="font-mono text-[9px] text-ink-dim">{hint}</p>
      ) : null}
    </div>
  );
}
