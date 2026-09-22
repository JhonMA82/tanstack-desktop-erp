import { type RefObject, useEffect, useState } from "react";

/**
 * Fit-to-width scale for a fixed-size document inside a scrollable canvas.
 * Recomputes whenever the container resizes (window resize, ribbon collapse,
 * outliner toggles) and is capped at `maxScale` so the paper never upscales
 * beyond its natural size.
 *
 * @param containerRef - The scrollable preview canvas.
 * @param paperWidth - Document width in CSS pixels.
 * @param maxScale - Upper bound for the computed scale (defaults to `0.6`).
 * @param padding - Horizontal padding subtracted from the canvas (defaults 16).
 * @returns The scale factor to apply with `transform: scale(...)`.
 */
export function usePaperScale(
  containerRef: RefObject<HTMLElement | null>,
  paperWidth: number,
  maxScale = 0.6,
  padding = 16,
): number {
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const update = () => {
      const available = container.clientWidth - padding * 2;
      const next = Math.min(maxScale, available / paperWidth);
      setScale(Number.isFinite(next) && next > 0.1 ? next : 0.1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, maxScale, paperWidth, padding]);

  return scale;
}
