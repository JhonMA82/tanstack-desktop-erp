import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

/** Badge tones and the four ledger status chips. */
export function BadgesSection() {
  return (
    <Panel title="Badges • Status">
      <div className="flex flex-col gap-3 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Default</Badge>
          <Badge tone="green">Green</Badge>
          <Badge tone="orange">Orange</Badge>
          <Badge tone="red">Red</Badge>
          <Badge tone="blue">Blue</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="POSTED" />
          <StatusBadge status="DRAFT" />
          <StatusBadge status="VOID" />
          <StatusBadge status="PENDING" />
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-ink-dim">
          <span>ACCENT BADGES:</span>
          <Badge tone="green">● LIVE</Badge>
          <Badge tone="orange">ACTION</Badge>
          <Badge tone="blue">NAVIGATION</Badge>
        </div>
      </div>
    </Panel>
  );
}
