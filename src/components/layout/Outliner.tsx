import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FAVORITES, MODULES } from "@/lib/modules";
import { useShell } from "./shell-context";

const ITEM_CLASSES =
  "flex h-[22px] w-full items-center gap-1.5 border-l-2 border-l-transparent px-2 text-left text-[11px] text-ink-dim transition-colors hover:bg-panel2 hover:text-ink";

/** Left outliner: favorite shortcuts plus the module tree (Blender outliner style). */
export function Outliner() {
  const { activeModule } = useShell();
  const activePath = activeModule.path;

  return (
    <aside
      className="hidden w-[210px] min-w-[210px] flex-col overflow-y-auto border-r border-border bg-panel-out md:flex"
      aria-label="Outliner"
    >
      <OutlinerSection title="Favorites">
        {FAVORITES.map((favorite) => (
          <Link
            key={favorite.label}
            to={favorite.path}
            className={cn(
              ITEM_CLASSES,
              activePath === favorite.path && "border-l-orange bg-panel3 text-ink-bright",
            )}
          >
            <span className="truncate">{favorite.label}</span>
          </Link>
        ))}
      </OutlinerSection>
      <OutlinerSection title="Modules">
        {MODULES.map((module) => (
          <Link
            key={module.id}
            to={module.path}
            className={cn(
              ITEM_CLASSES,
              activePath === module.path && "border-l-orange bg-panel3 text-ink-bright",
            )}
          >
            <span className="truncate">{module.label}</span>
            <span className="ml-auto shrink-0 font-mono text-[8px] text-ink-dim">
              {module.count}
            </span>
          </Link>
        ))}
      </OutlinerSection>
    </aside>
  );
}

function OutlinerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="flex h-5 items-center border-b border-border bg-panel2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-dim">
        {title}
      </h2>
      <div className="py-0.5">{children}</div>
    </div>
  );
}
