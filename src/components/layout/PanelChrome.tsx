/** Shared collapse affordances for the outliner (left) and inspector (right) side panels. */
export interface PanelChromeProps {
  /** Panel title used in the header and in the button labels. */
  title: string;
  /** Which side of the viewport the panel sits on; drives the chevron direction. */
  side: "left" | "right";
  /** Flips the panel between its expanded and collapsed states. */
  onToggle: () => void;
}

/**
 * Slim header strip shown while the panel is expanded: title on the left,
 * collapse button pinned to the far edge of the panel.
 */
export function PanelCollapseBar({ title, side, onToggle }: PanelChromeProps) {
  return (
    <div className="flex h-5 shrink-0 items-stretch border-b border-border bg-panel2">
      <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate px-2 text-[10px] font-bold tracking-[0.08em] text-ink-dim uppercase">
        {title}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Collapse ${title}`}
        aria-expanded
        className="w-6 shrink-0 cursor-pointer border-l border-border text-[10px] text-ink-dim hover:bg-panel3 hover:text-ink-bright"
      >
        {side === "left" ? "◂" : "▸"}
      </button>
    </div>
  );
}

/**
 * Vertical strip shown while the panel is collapsed: keeps a clickable handle
 * so the panel can always be expanded again (chevron first, rotated label below).
 */
export function PanelRail({ title, side, onToggle }: PanelChromeProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Expand ${title}`}
      aria-expanded={false}
      className="flex w-full flex-1 cursor-pointer flex-col items-center gap-2 border-border bg-panel2 py-2 text-ink-dim hover:text-ink-bright"
    >
      <span className="text-[10px]" aria-hidden="true">
        {side === "left" ? "▸" : "◂"}
      </span>
      <span className="rotate-180 text-[9px] font-bold tracking-[0.08em] uppercase [writing-mode:vertical-rl]">
        {title}
      </span>
    </button>
  );
}
