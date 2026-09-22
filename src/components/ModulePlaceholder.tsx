import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { moduleById } from "@/lib/modules";

export interface ModulePlaceholderProps {
  /** Module id as registered in `src/lib/modules.ts`. */
  id: string;
}

/**
 * Empty-state page for modules that are not migrated yet. It documents the
 * pattern to follow: data fetchers in `src/data`, components under
 * `src/components/<id>/`, composition in `src/routes/<id>.tsx`.
 */
export function ModulePlaceholder({ id }: ModulePlaceholderProps) {
  const definition = moduleById(id);

  return (
    <div className="p-2">
      <Panel
        title={`Module • ${definition.label}`}
        actions={<Badge tone="orange">PLACEHOLDER</Badge>}
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[28px] font-bold text-ink-bright">
              {definition.label}
            </span>
            <Badge>{definition.count}</Badge>
          </div>
          <p className="max-w-[60ch] text-[12px] leading-relaxed text-ink-dim">
            {definition.description}
          </p>
          <p className="font-mono text-[10px] leading-relaxed text-ink-dim">
            Migrate this module like Dashboard: add fetchers in src/data/{definition.id}.ts, build
            components under src/components/{definition.id}/ and compose them in src/routes/
            {definition.id}.tsx.
          </p>
          <Link
            to="/dashboard"
            className="font-mono text-[11px] text-orange underline-offset-2 hover:underline"
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
      </Panel>
    </div>
  );
}
