import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  value: number;
  /** Receives the next numeric value while dragging. */
  onValueChange: (value: number) => void;
}

/**
 * Range slider (source: `SALARY (DRAG ↔)`); the square orange thumb and
 * panel track are styled in `src/styles/index.css`.
 */
export function Slider({ value, onValueChange, className, ...rest }: SliderProps) {
  return (
    <input
      type="range"
      value={value}
      onChange={(event) => onValueChange(Number(event.target.value))}
      className={cn("h-4 w-full cursor-ew-resize", className)}
      {...rest}
    />
  );
}
