import { useEffect, useState } from "react";
import { useShell } from "./shell-context";
import { useModuleRows } from "./use-module-rows";

/** Viewport header (`vp-top`): module breadcrumb, view/period, rows and clock readout. */
export function ViewportHeader() {
  const { activeModule, view, period } = useShell();
  const rows = useModuleRows();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("en-GB"));

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date().toLocaleTimeString("en-GB")), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-5 min-h-5 items-center gap-2 overflow-x-auto border-b border-border bg-panel2 px-2 font-mono text-[9px] whitespace-nowrap text-ink-dim">
      <span>{`${activeModule.label} // VIEWPORT`}</span>
      <span aria-hidden="true">•</span>
      <span>
        {view} • {period}
      </span>
      <span aria-hidden="true">•</span>
      <span>{rows} ROWS • 0 SELECTED</span>
      <span className="ml-auto">{clock} • 60 FPS • SCALE 1.000</span>
    </div>
  );
}
