import type { IconName } from "@/lib/icons";
import { ICONS } from "@/lib/icons";

export interface IconProps {
  /** Icon key from the extracted path map. */
  name: IconName;
  /** Rendered size in px (16×16 viewBox; original defaults to 12). */
  size?: number;
  className?: string;
}

/**
 * Stroke icon renderer matching the source bundle's `M` component:
 * 16×16 viewBox, `currentColor`, 1.2 stroke, square caps.
 */
export function Icon({ name, size = 12, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}
