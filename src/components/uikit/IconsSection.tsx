import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import type { IconName } from "@/lib/icons";
import { ICONS } from "@/lib/icons";

const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** The full extracted icon set (31 strokes) with their keys. */
export function IconsSection() {
  return (
    <Panel title="Icons" actions={`${ICON_NAMES.length} STROKES • 16×16`}>
      <div className="grid grid-cols-4 gap-px bg-border p-px sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-11">
        {ICON_NAMES.map((name) => (
          <div
            key={name}
            className="flex h-14 flex-col items-center justify-center gap-1 bg-panel text-ink-dim hover:bg-panel3 hover:text-orange"
          >
            <Icon name={name} size={16} />
            <span className="font-mono text-[8px] tracking-wide">{name}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
