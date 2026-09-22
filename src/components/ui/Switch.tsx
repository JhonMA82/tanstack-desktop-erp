import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  /** Receives the next checked state on toggle. */
  onCheckedChange: (checked: boolean) => void;
  /** Visible label rendered next to the track. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Switch in the source UI's knob style (8px square knob, 120ms transition):
 * orange track and black knob when on, dim knob when off.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "flex cursor-pointer items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        className={cn(
          "relative h-3 w-6 rounded-[2px] border transition-colors duration-100",
          checked ? "border-orange bg-orange" : "border-border bg-panel3",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-2 -translate-y-1/2 rounded-[1px] transition-all duration-100",
            checked ? "left-[2px] translate-x-[12px] bg-black" : "left-[2px] bg-[var(--text-dim)]",
          )}
        />
      </span>
      {label ? <span className="text-[11px] text-ink">{label}</span> : null}
    </button>
  );
}
