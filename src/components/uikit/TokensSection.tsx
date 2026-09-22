import { Panel } from "@/components/ui/Panel";

/** Design tokens with their dark/light values plus typography samples. */
const TOKENS: Array<{ name: string; dark: string; light: string }> = [
  { name: "--bg", dark: "#0E0E0E", light: "#D5D5D5" },
  { name: "--header", dark: "#181818", light: "#E0E0E0" },
  { name: "--panel", dark: "#1E1E1E", light: "#EAEAEA" },
  { name: "--panel2", dark: "#252525", light: "#E0E0E0" },
  { name: "--panel3", dark: "#2A2A2A", light: "#D8D8D8" },
  { name: "--panel-out", dark: "#1A1A1A", light: "#DEDEDE" },
  { name: "--border", dark: "#323232", light: "#B8B8B8" },
  { name: "--borderL", dark: "#3A3A3A", light: "#9A9A9A" },
  { name: "--text", dark: "#CCCCCC", light: "#222222" },
  { name: "--text-dim", dark: "#7A7A7A", light: "#6A6A6A" },
  { name: "--text-bright", dark: "#EEEEEE", light: "#111111" },
  { name: "--orange", dark: "#FF8C32", light: "#FF8C32" },
  { name: "--blue", dark: "#4C8CFF", light: "#4C8CFF" },
  { name: "--red", dark: "#FF4444", light: "#FF4444" },
  { name: "--green", dark: "#3DDC84", light: "#3DDC84" },
];

/** Color tokens (live swatches) and typography reference. */
export function TokensSection() {
  return (
    <Panel title="Design System • Tokens" actions="DARK / LIGHT">
      <div className="grid grid-cols-1 gap-x-6 p-2 sm:grid-cols-2 xl:grid-cols-3">
        {TOKENS.map((token) => (
          <div
            key={token.name}
            className="flex h-6 items-center gap-2 border-b border-border/60 font-mono text-[10px]"
          >
            <span
              className="size-4 shrink-0 rounded-[2px] border border-border"
              style={{ background: `var(${token.name})` }}
              aria-hidden="true"
            />
            <span className="text-ink">{token.name}</span>
            <span className="ml-auto text-ink-dim">{token.dark}</span>
            <span className="text-ink-dim">/</span>
            <span className="text-ink-dim">{token.light}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1 border-t border-border p-2">
        <div className="text-[18px] font-bold text-ink-bright">Inter — Heading 18px bold</div>
        <div className="text-[12px] text-ink">
          Inter — Body 12px regular for readable descriptions.
        </div>
        <div className="text-[10px] tracking-[0.06em] text-ink-dim uppercase">
          Inter — Micro label 10px uppercase tracking
        </div>
        <div className="font-mono text-[11px] text-ink">
          JetBrains Mono 11px — $42,128.00 • INV-2024-1248
        </div>
      </div>
    </Panel>
  );
}
