import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { COMPANY, SYSTEM_PERFORMANCE } from "@/data/system";
import { useShell } from "./shell-context";

/** Right inspector: active module info, theme toggle, company data and system performance. */
export function PropertiesPanel() {
  const { activeModule, theme, toggleTheme } = useShell();
  const { cpuPercent, ramUsedGb, ramTotalGb, vramUsedGb, vramTotalGb, fps } = SYSTEM_PERFORMANCE;

  return (
    <aside
      className="hidden w-[240px] min-w-[240px] flex-col overflow-y-auto border-l border-border bg-panel xl:flex"
      aria-label="Properties"
    >
      <PropertiesSection title="Module">
        <div className="flex items-center justify-between gap-2 px-2 pt-1.5 text-[11px]">
          <span className="font-bold uppercase tracking-[0.05em] text-ink-bright">
            {activeModule.label}
          </span>
          <span className="font-mono text-[9px] text-ink-dim">{activeModule.count}</span>
        </div>
        <p className="px-2 pt-1 pb-2 text-[10px] leading-snug text-ink-dim">
          {activeModule.description}
        </p>
      </PropertiesSection>

      <PropertiesSection title="Appearance">
        <div className="p-2">
          <Button className="w-full" onClick={toggleTheme}>
            {theme === "dark" ? "DARK MODE" : "LIGHT MODE"}
          </Button>
        </div>
      </PropertiesSection>

      <PropertiesSection title="Company">
        <PropertyRow label="COMPANY" value={COMPANY.name} />
        <PropertyRow label="FISCAL YEAR" value={COMPANY.fiscalYear} />
        <PropertyRow label="BASE CURRENCY" value={COMPANY.currency} />
      </PropertiesSection>

      <PropertiesSection title="System • Performance">
        <div className="flex flex-col gap-1.5 px-2 py-2">
          <Meter
            label="CPU"
            value={`${cpuPercent}%`}
            ratio={cpuPercent / 100}
            accent="var(--blue)"
          />
          <Meter
            label="RAM"
            value={`${ramUsedGb}/${ramTotalGb}GB`}
            ratio={ramUsedGb / ramTotalGb}
            accent="var(--orange)"
          />
          <Meter
            label="VRAM"
            value={`${vramUsedGb}/${vramTotalGb}GB`}
            ratio={vramUsedGb / vramTotalGb}
            accent="var(--orange)"
          />
          <Meter label="FPS" value={`${fps}`} ratio={fps / 60} accent="var(--green)" />
        </div>
      </PropertiesSection>
    </aside>
  );
}

function PropertiesSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border">
      <h2 className="flex h-[22px] items-center gap-1.5 bg-panel2 px-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-bright">
        {title}
      </h2>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1 text-[10px]">
      <span className="uppercase tracking-[0.06em] text-ink-dim">{label}</span>
      <span className="text-right font-mono text-ink">{value}</span>
    </div>
  );
}

function Meter({
  label,
  value,
  ratio,
  accent,
}: {
  label: string;
  value: string;
  ratio: number;
  accent: string;
}) {
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 font-mono text-[9px] text-ink-dim">{label}</span>
      <span className="h-1 flex-1 bg-border">
        <span className="block h-full" style={{ width: `${percent}%`, background: accent }} />
      </span>
      <span className="w-16 shrink-0 text-right font-mono text-[9px] text-ink">{value}</span>
    </div>
  );
}
