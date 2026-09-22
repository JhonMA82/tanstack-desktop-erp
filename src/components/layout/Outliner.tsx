import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { FAVORITES, MODULES } from "@/lib/modules";
import { useShell } from "./shell-context";

const ITEM_CLASSES =
  "flex h-[22px] w-full items-center gap-1.5 border-l-2 border-l-transparent px-2 text-left text-[11px] text-ink-dim transition-colors hover:bg-panel2 hover:text-ink";

/** Left outliner: collapsible favorites and module sections (Blender outliner style). */
export function Outliner() {
  const { activeModule } = useShell();
  const [open, setOpen] = useState({ favorites: true, modules: true });
  const activePath = activeModule.path;

  return (
    <aside
      className="hidden w-[210px] min-w-[210px] flex-col overflow-y-auto border-r border-border bg-panel-out md:flex"
      aria-label="Outliner"
    >
      <OutlinerSection
        title="Favorites"
        open={open.favorites}
        onToggle={() => setOpen((s) => ({ ...s, favorites: !s.favorites }))}
      >
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
      <OutlinerSection
        title="Modules"
        open={open.modules}
        onToggle={() => setOpen((s) => ({ ...s, modules: !s.modules }))}
      >
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

interface OutlinerSectionProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

function OutlinerSection({ title, open, onToggle, children }: OutlinerSectionProps) {
  return (
    <div className="flex min-h-0 flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-5 shrink-0 items-center gap-1 border-b border-border bg-panel2 px-2 text-[10px] font-bold tracking-[0.08em] text-ink-dim uppercase hover:text-ink-bright"
      >
        {open ? "▾" : "▸"} {title}
      </button>
      {open ? <div className="py-0.5">{children}</div> : null}
    </div>
  );
}
