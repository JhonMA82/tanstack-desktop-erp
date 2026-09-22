import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Visible label rendered next to the box. */
  label?: string;
}

/** Native checkbox tinted with the accent token (`accent-color` keeps platform a11y). */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2 text-[11px] text-ink", className)}>
      <input type="checkbox" className="size-3.5 shrink-0 cursor-pointer accent-orange" {...rest} />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
