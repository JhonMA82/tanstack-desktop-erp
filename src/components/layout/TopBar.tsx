import { useNavigate } from "@tanstack/react-router";
import { useToast } from "@/components/feedback/toaster";
import { Icon } from "@/components/ui/Icon";
import { useShell } from "./shell-context";

/**
 * 28px top bar from the source UI: brand, file path, Quick Access Toolbar
 * (save/undo/redo/search), object search that focuses the palette, LIVE chip,
 * company marker, theme toggle and avatar.
 */
export function TopBar() {
  const { theme, toggleTheme, setPaletteOpen, activeModule } = useShell();
  const { push } = useToast();
  const navigate = useNavigate();

  return (
    <header className="relative z-10 flex h-7 min-h-7 items-center gap-2.5 border-b border-border bg-header px-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="size-2 shrink-0 rounded-[2px] bg-orange" aria-hidden="true" />
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-bright">
          ● ERP CORE v1.0
        </span>
        <span className="file-path min-w-0 truncate font-mono text-[10px] text-ink-dim">
          — /company/acme_corp — LEDGER: ACME_CORP.blend — {activeModule.label}
        </span>
        <div
          className="flex shrink-0 gap-px rounded-[2px] border border-border bg-panel2 p-px"
          title="Quick Access"
        >
          <button
            type="button"
            aria-label="Save"
            onClick={() =>
              push({ kind: "SUCCESS", title: "SAVED", message: "Ledger saved — ACME_CORP.blend" })
            }
            className="flex size-5 items-center justify-center rounded-[2px] border border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink"
          >
            <Icon name="save" />
          </button>
          <button
            type="button"
            aria-label="Undo"
            className="flex size-5 items-center justify-center rounded-[2px] border border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink"
          >
            <Icon name="undo" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            className="flex size-5 items-center justify-center rounded-[2px] border border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink"
          >
            <Icon name="redo" />
          </button>
          <button
            type="button"
            aria-label="Search"
            onClick={() => setPaletteOpen(true)}
            className="flex size-5 items-center justify-center rounded-[2px] border border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink"
          >
            <Icon name="search" />
          </button>
        </div>
      </div>

      <div className="relative flex w-[220px] shrink-0 items-center">
        <span
          className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-ink-dim"
          aria-hidden="true"
        >
          <Icon name="search" size={10} />
        </span>
        <input
          aria-label="Search objects"
          placeholder="SEARCH OBJECTS (Ctrl+K)"
          onFocus={() => setPaletteOpen(true)}
          className="h-5 w-full rounded-[2px] border border-border bg-panel2 pl-[22px] pr-2 font-mono text-[10px] text-ink outline-none placeholder:text-ink-dim focus:border-orange"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 font-mono text-[10px] text-ink-dim">
        <span className="flex h-4 items-center gap-1.5 rounded-[2px] border border-border bg-panel2 px-1.5 text-[9px] font-bold tracking-[0.08em]">
          <i
            className="inline-block size-1.5 rounded-[1px] bg-green animate-[erp-pulse_1.2s_infinite]"
            aria-hidden="true"
          />
          LIVE ●
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-orange" aria-hidden="true" />
          COMPANY: ACME
        </span>
        <button
          type="button"
          title="Theme"
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="flex size-5 items-center justify-center rounded-[2px] border border-border bg-panel2 text-[10px] font-bold text-ink-dim hover:border-orange hover:text-orange"
        >
          {theme === "dark" ? "◑" : "◐"}
        </button>
        <button
          type="button"
          aria-label="Open settings"
          onClick={() => void navigate({ to: "/settings" })}
          className="flex size-5 items-center justify-center rounded-[2px] border border-border bg-panel3 font-mono text-[9px] font-bold text-ink-bright"
        >
          AC
        </button>
      </div>
    </header>
  );
}
