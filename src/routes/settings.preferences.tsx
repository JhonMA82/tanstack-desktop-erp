import { createFileRoute } from "@tanstack/react-router";
import { useShell } from "@/components/layout/shell-context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

/**
 * Child page of Settings: the base's working example of a nested route
 * (`/settings/preferences`). The parent layout renders the `<Outlet/>` this page
 * fills, and the URL is shareable on its own.
 */
export const Route = createFileRoute("/settings/preferences")({
  component: SettingsPreferencesPage,
});

function SettingsPreferencesPage() {
  const { theme, toggleTheme } = useShell();

  return (
    <div className="flex flex-col gap-2 p-2">
      <Panel
        title="Appearance"
        actions={<Badge tone={theme === "dark" ? "orange" : "blue"}>{theme.toUpperCase()}</Badge>}
      >
        <div className="flex flex-col gap-3 p-4">
          <p className="max-w-[70ch] text-[12px] leading-relaxed text-ink-dim">
            The theme is applied as a <span className="font-mono">light</span> class on the document
            root and persisted in <span className="font-mono">localStorage</span> under{" "}
            <span className="font-mono">app-theme</span>. Every color comes from the tokens in{" "}
            <span className="font-mono">src/styles/index.css</span>, so both themes stay consistent
            without touching a component.
          </p>
          <div className="flex items-center gap-3">
            <Button onClick={toggleTheme}>TOGGLE THEME</Button>
            <span className="font-mono text-[10px] text-ink-dim">STORAGE KEY: app-theme</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
