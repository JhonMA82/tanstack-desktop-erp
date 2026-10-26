import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ModuleDef } from "@/config/navigation";
import { MODULES, visiblePagesOf } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { type PanelChromeProps, PanelCollapseBar, PanelRail } from "./PanelChrome";
import { useShell } from "./shell-context";

const ITEM_CLASSES =
  "flex h-[22px] min-w-0 flex-1 items-center gap-1.5 border-l-2 border-l-transparent px-2 text-left text-[11px] text-ink-dim transition-colors hover:bg-panel2 hover:text-ink";

const ACTIVE_CLASSES = "border-l-orange bg-panel3 text-ink-bright";

interface OutlinerProps extends PanelChromeProps {
  /** Collapses the whole panel to a vertical rail. */
  collapsed: boolean;
}

/**
 * Left outliner: the module tree. A module with `pages` in the navigation
 * registry expands into its nested routes (the app's submenus), so a new page
 * shows up here without touching this component.
 */
export function Outliner({ collapsed, title, side, onToggle }: OutlinerProps) {
  const { activeModule } = useShell();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [modulesOpen, setModulesOpen] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (collapsed) {
    return (
      <aside
        className="hidden w-6 min-w-6 flex-col border-r border-border bg-panel-out md:flex"
        aria-label="Outliner (collapsed)"
      >
        <PanelRail title={title} side={side} onToggle={onToggle} />
      </aside>
    );
  }

  return (
    <aside
      className="hidden w-[210px] min-w-[210px] flex-col overflow-y-auto border-r border-border bg-panel-out md:flex"
      aria-label="Outliner"
    >
      <PanelCollapseBar title={title} side={side} onToggle={onToggle} />
      <div className="flex min-h-0 flex-col">
        <button
          type="button"
          onClick={() => setModulesOpen((open) => !open)}
          aria-expanded={modulesOpen}
          className="flex h-5 shrink-0 items-center gap-1 border-b border-border bg-panel2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-dim hover:text-ink-bright"
        >
          <Icon name={modulesOpen ? "chevron-down" : "chevron-right"} size={9} /> Modules
        </button>
        {modulesOpen ? (
          <div className="py-0.5">
            {MODULES.map((module) => (
              <ModuleNode
                key={module.id}
                module={module}
                pathname={pathname}
                open={expanded[module.id] ?? module.id === activeModule.id}
                onToggle={() =>
                  setExpanded((state) => ({
                    ...state,
                    [module.id]: !(state[module.id] ?? module.id === activeModule.id),
                  }))
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

interface ModuleNodeProps {
  module: ModuleDef;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}

/** One module row plus its nested pages when expanded. */
function ModuleNode({ module, pathname, open, onToggle }: ModuleNodeProps) {
  const pages = visiblePagesOf(module.id);
  const hasPages = pages.length > 0;
  const isModuleActive = pathname === module.path || pathname === `${module.path}/`;

  return (
    <div className="flex flex-col">
      <div className="flex items-stretch">
        {hasPages ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={`${module.label} pages`}
            className="flex w-[18px] shrink-0 cursor-pointer items-center justify-center font-mono text-[9px] text-ink-dim hover:text-ink-bright"
          >
            <Icon name={open ? "chevron-down" : "chevron-right"} size={9} />
          </button>
        ) : (
          <span className="w-[18px] shrink-0" aria-hidden="true" />
        )}
        <Link
          to={module.path}
          activeOptions={{ exact: true }}
          className={cn(ITEM_CLASSES, isModuleActive && ACTIVE_CLASSES)}
        >
          <span className="truncate">{module.label}</span>
          <span className="ml-auto shrink-0 font-mono text-[8px] text-ink-dim">{module.count}</span>
        </Link>
      </div>
      {hasPages && open
        ? pages.map((page) => (
            <Link
              key={page.id}
              to={page.path}
              activeOptions={{ exact: true }}
              className={cn(ITEM_CLASSES, "pl-6", pathname === page.path && ACTIVE_CLASSES)}
            >
              <span className="truncate">{page.label}</span>
            </Link>
          ))
        : null}
    </div>
  );
}
