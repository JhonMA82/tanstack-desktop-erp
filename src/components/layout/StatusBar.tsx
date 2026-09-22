/** Bottom status bar: keyboard hints on the left, product signature on the right. */
export function StatusBar() {
  return (
    <footer className="flex h-5 min-h-5 items-center justify-between border-t border-border bg-panel px-2 font-mono text-[9px] text-ink-dim">
      <span>↑↓ NAV • ENTER EXEC • ESC CLOSE • CTRL+K TOGGLE</span>
      <span className="text-orange">ERP CORE v1 — BLENDER EDITION</span>
    </footer>
  );
}
