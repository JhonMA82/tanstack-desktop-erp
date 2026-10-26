import { SYSTEM_PERFORMANCE } from "@/data/system";
import { useShell } from "./shell-context";

/**
 * 24px status bar from the source UI: animated progress sweep, READY state, the
 * orange `[MODULE • PAGE]` bracket and the system performance readouts. It reads
 * the registry only — no module data reaches the shell.
 */
export function StatusBar() {
  const { activeModule, activePage } = useShell();
  const scope = activePage ? `${activeModule.label} • ${activePage.label}` : activeModule.label;
  const { cpuPercent, ramUsedGb, ramTotalGb, vramUsedGb, vramTotalGb, fps } = SYSTEM_PERFORMANCE;

  return (
    <footer className="relative z-[3] flex h-6 min-h-6 items-center justify-between gap-3 overflow-hidden border-t border-border bg-header px-2 font-mono text-[10px] text-ink-dim">
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden="true">
        <div className="h-0.5 w-[42%] bg-orange animate-[app-prog_2s_linear_infinite]" />
      </div>
      <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
        <span>READY</span>
        <span aria-hidden="true">|</span>
        <span className="text-orange">[{scope}]</span>
        <span className="text-ink-dim">FRAME 1247 • 24FPS</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span>CPU {cpuPercent}%</span>
        <span>
          RAM {ramUsedGb}/{ramTotalGb}GB
        </span>
        <span>
          VRAM {vramUsedGb}/{vramTotalGb}GB
        </span>
        <span>{fps} FPS</span>
        <span className="inline-block size-2 rounded-[1px] bg-green" aria-hidden="true" />
      </div>
    </footer>
  );
}
