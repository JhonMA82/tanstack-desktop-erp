import type { IconName } from "@/lib/icons";
import { ICONS } from "@/lib/icons";

export interface IconProps {
  /** Icon key of the curated vocabulary in `src/lib/icons.ts`. */
  name: IconName;
  /** Rendered size in px (Lucide draws on a 24×24 grid). */
  size?: number;
  className?: string;
}

/**
 * The only icon renderer: maps the curated vocabulary to its Lucide component and
 * fixes the shell's stroke. Weight scales with size (2 on a 24 grid), so 10/12/14px
 * land at ~0.83/1.00/1.17px — the progression the hand-drawn set had.
 *
 * Icons are decorative: the accessible name always comes from the surrounding text
 * or `aria-label`, never from the glyph.
 */
export function Icon({ name, size = 12, className }: IconProps) {
  const Glyph = ICONS[name];

  return (
    <Glyph
      size={size}
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
      aria-hidden="true"
    />
  );
}
