import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { ADMIN_METRIC_CARDS } from "@/data/admin-dashboard";

/** KPI cards from the reference admin dashboard: icon box, value, trend badge, caption. */
export function MetricCardsSection() {
  return (
    <Panel title="Metric Cards" actions="4 KPI">
      <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_METRIC_CARDS.map((card) => (
          <article
            key={card.label}
            className="flex flex-col gap-1.5 rounded-[2px] border border-border bg-linear-to-t from-orange/[0.04] to-transparent bg-panel p-3"
          >
            <span className="flex size-7 items-center justify-center rounded-[4px] border border-border bg-panel2 text-ink-dim">
              <Icon name={card.icon} size={16} />
            </span>
            <span className="text-[10px] font-bold tracking-[0.08em] text-ink-dim uppercase">
              {card.label}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[24px] leading-none font-bold tabular-nums text-ink-bright">
                {card.value}
              </span>
              <Badge tone={card.deltaUp ? "green" : "red"}>
                {card.deltaUp ? "▲" : "▼"} {card.delta}
              </Badge>
            </div>
            <p className="text-[10px] text-ink-dim">{card.caption}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}
