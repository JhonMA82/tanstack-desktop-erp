import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/ui/Panel";
import { APP, COMPANY } from "@/config/app";

/**
 * Index page of a nested module: a static page with no data resource, so it also
 * documents the simplest route shape (no loader, no query).
 */
export const Route = createFileRoute("/settings/")({
  component: SettingsProfilePage,
});

function SettingsProfilePage() {
  return (
    <div className="grid grid-cols-1 gap-2 p-2 lg:grid-cols-2">
      <Panel title="Brand">
        <dl className="flex flex-col">
          <PropertyRow label="NAME" value={APP.name} />
          <PropertyRow label="VERSION" value={APP.version} />
          <PropertyRow label="MARK" value={APP.mark} />
          <PropertyRow label="ORGANIZATION" value={APP.organization} />
          <PropertyRow label="INITIALS" value={APP.initials} />
          <PropertyRow label="FILE PATH" value={APP.filePath} />
          <PropertyRow label="TAGLINE" value={APP.tagline} />
        </dl>
      </Panel>
      <Panel title="Company">
        <dl className="flex flex-col">
          <PropertyRow label="NAME" value={COMPANY.name} />
          <PropertyRow label="FISCAL YEAR" value={COMPANY.fiscalYear} />
          <PropertyRow label="BASE CURRENCY" value={COMPANY.currency} />
        </dl>
        <p className="border-t border-border px-2 py-2 text-[10px] leading-snug text-ink-dim">
          Both blocks come from <span className="font-mono">src/config/app.ts</span>. The shell
          reads them from there, so rebranding never means editing a layout component.
        </p>
      </Panel>
    </div>
  );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-2 py-1 text-[10px] last:border-b-0">
      <dt className="uppercase tracking-[0.06em] text-ink-dim">{label}</dt>
      <dd className="truncate text-right font-mono text-ink">{value}</dd>
    </div>
  );
}
