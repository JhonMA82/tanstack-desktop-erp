import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { MODULES } from "@/lib/modules";
import { useShell } from "./shell-context";

/** Top menu bar: brand, module tabs with counters, palette/theme controls and avatar. */
export function ModuleMenu() {
  const { activeModule, theme, toggleTheme, setPaletteOpen } = useShell();

  return (
    <header className="flex h-8 min-h-8 items-stretch overflow-x-auto border-b border-border bg-panel px-1">
      <div className="flex shrink-0 items-center gap-2 pl-1 pr-3">
        <span className="size-2 rounded-[2px] bg-orange" aria-hidden="true" />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-bright">
          ERP CORE v1.0
        </span>
        <span className="flex h-4 items-center gap-1 rounded-[2px] border border-border bg-panel2 px-1.5 font-mono text-[9px] font-bold text-ink-dim">
          <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
          LIVE
        </span>
      </div>
      <span className="my-auto h-[18px] w-px shrink-0 bg-border" aria-hidden="true" />
      <nav aria-label="Modules" className="flex items-stretch">
        {MODULES.map((module) => {
          const isActive = module.id === activeModule.id;
          return (
            <Link
              key={module.id}
              to={module.path}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 border-b-2 border-b-transparent px-3.5 text-[11px] font-semibold uppercase tracking-[0.05em] transition-colors",
                isActive ? "border-b-orange text-ink-bright" : "text-ink-dim hover:text-ink",
              )}
            >
              <span>{module.label}</span>
              <span className="font-mono text-[8px] text-ink-dim">{module.count}</span>
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-3">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="h-[22px] rounded-[2px] border border-border bg-panel2 px-2 font-mono text-[9px] text-ink-dim hover:text-ink-bright"
        >
          CTRL K
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="h-[22px] rounded-[2px] border border-border bg-panel2 px-2 text-[9px] font-bold uppercase tracking-[0.06em] text-ink-dim hover:text-ink-bright"
        >
          {theme === "dark" ? "DARK MODE" : "LIGHT MODE"}
        </button>
        <span
          className="flex size-5 items-center justify-center rounded-[2px] border border-border bg-panel3 font-mono text-[9px] text-ink"
          title="ACME CORP"
        >
          AC
        </span>
      </div>
    </header>
  );
}
