import { cn } from "@/lib/cn";

export interface TabDef {
  /** Stable tab id used as the React key and active state. */
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabDef[];
  /** Id of the selected tab. */
  active: string;
  /** Selects a tab. */
  onActiveChange: (id: string) => void;
  className?: string;
}

/** Tab strip in the module-menu style (orange underline + panel3 active state). */
export function Tabs({ tabs, active, onActiveChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("flex items-stretch border-b border-border bg-panel", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onActiveChange(tab.id)}
            className={cn(
              "flex h-7 cursor-pointer items-center border-b-2 border-b-transparent px-3.5 text-[10px] font-semibold tracking-[0.06em] uppercase transition-colors",
              selected
                ? "border-b-orange bg-panel3 text-ink-bright"
                : "text-ink-dim hover:bg-panel2 hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
