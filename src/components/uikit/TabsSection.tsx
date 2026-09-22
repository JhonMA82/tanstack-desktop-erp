import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { Tabs } from "@/components/ui/Tabs";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "source", label: "Source" },
  { id: "history", label: "History" },
];

const COPY: Record<string, string> = {
  overview:
    "Panel content — Overview. Tabs share the module-menu style: orange underline, panel3 active state.",
  source: "Panel content — Source. Controlled by useState, fully typed via the TabDef list.",
  history: "Panel content — History. Three revisions recorded for this scaffold.",
};

/** Tab strip with controlled panel content below. */
export function TabsSection() {
  const [active, setActive] = useState("overview");

  return (
    <Panel title="Tabs">
      <Tabs tabs={TABS} active={active} onActiveChange={setActive} />
      <div className="flex items-start gap-2 p-3 text-[11px] text-ink">
        <span className="font-mono text-[9px] text-orange">{active.toUpperCase()}</span>
        <span>{COPY[active]}</span>
      </div>
    </Panel>
  );
}
