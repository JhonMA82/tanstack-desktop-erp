import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { MODULES } from "@/lib/modules";
import { useShell } from "./shell-context";

/**
 * 32px module tab row from the source UI: uppercase tabs with mono counters,
 * a separator every three tabs and the ribbon collapse/expand button on the right.
 */
export function ModuleMenu() {
  const { activeModule, ribbonCollapsed, toggleRibbon } = useShell();

  return (
    <nav
      aria-label="Modules"
      className="flex h-8 min-h-8 items-stretch overflow-x-auto border-b border-border bg-panel px-1 whitespace-nowrap"
    >
      {MODULES.map((module, index) => {
        const isActive = module.id === activeModule.id;
        return (
          <Fragment key={module.id}>
            <Link
              to={module.path}
              className={cn(
                "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 border-b-2 border-b-transparent px-3.5 text-[11px] font-semibold tracking-[0.05em] uppercase transition-colors",
                isActive
                  ? "border-b-orange bg-panel3 text-ink-bright"
                  : "text-ink-dim hover:bg-panel2 hover:text-ink",
              )}
            >
              <span>{module.label}</span>
              <small className="font-mono text-[8px] text-ink-dim">{module.count}</small>
            </Link>
            {(index + 1) % 3 === 0 && index !== MODULES.length - 1 ? (
              <span className="my-auto h-[18px] w-px shrink-0 bg-border" aria-hidden="true" />
            ) : null}
          </Fragment>
        );
      })}
      <button
        type="button"
        onClick={toggleRibbon}
        className="ml-auto flex h-[22px] shrink-0 cursor-pointer items-center gap-1 self-center rounded-[2px] border border-border bg-panel2 px-2 text-[9px] tracking-[0.06em] uppercase text-ink-dim hover:text-ink-bright"
      >
        {ribbonCollapsed ? "▼ EXPAND RIBBON" : "▲ COLLAPSE RIBBON"}
      </button>
    </nav>
  );
}
