import { useEffect, useState } from "react";
import { useShell } from "./shell-context";

/** Viewport header: active module breadcrumb plus clock, FPS and scale readout. */
export function ViewportHeader() {
  const { activeModule } = useShell();
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("en-GB"));

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date().toLocaleTimeString("en-GB")), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex h-6 min-h-6 items-center justify-between border-b border-border bg-panel-out px-2 font-mono text-[9px] text-ink-dim">
      <span className="uppercase tracking-[0.08em]">viewport • {activeModule.label}</span>
      <span>{clock} • 60 FPS • SCALE 1.000</span>
    </div>
  );
}
