import { useNavigate } from "@tanstack/react-router";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { useShell } from "@/components/layout/shell-context";
import { cn } from "@/lib/cn";
import type { Command } from "./commands";
import { createCommands } from "./commands";

const GROUP_CLASSES: Record<Command["group"], string> = {
  NAVIGATION: "border-blue text-blue",
  ACTIONS: "border-orange text-orange",
};

/** Ctrl+K command palette: fuzzy filter, arrow-key navigation and command execution. */
export function CommandPalette() {
  const { setPaletteOpen, toggleTheme } = useShell();
  const { push } = useToast();
  const routerNavigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo(() => createCommands(), []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return commands;
    }
    return commands.filter((command) =>
      `${command.group} ${command.label} ${command.hint}`.toLowerCase().includes(needle),
    );
  }, [commands, query]);

  const close = () => setPaletteOpen(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPaletteOpen]);

  const runCommand = (command: Command) => {
    command.run({
      navigate: (path) => {
        void routerNavigate({ to: path });
      },
      toggleTheme,
      notify: push,
      close,
    });
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const command = filtered[activeIndex];
      if (command) {
        event.preventDefault();
        runCommand(command);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/55 pt-[14vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative flex max-h-[70vh] w-[460px] max-w-[92vw] flex-col overflow-hidden rounded-[2px] border border-border-l bg-panel2 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          aria-label="Command search"
          placeholder="Type a command…"
          className="h-8 shrink-0 border-b border-border bg-panel3 px-2.5 font-mono text-[12px] text-ink-bright outline-none placeholder:text-ink-dim"
        />
        <div className="min-h-0 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2.5 py-3 font-mono text-[11px] text-ink-dim">
              NO MATCHING COMMANDS
            </div>
          ) : (
            filtered.map((command, index) => (
              <button
                key={command.id}
                type="button"
                onClick={() => runCommand(command)}
                onMouseMove={() => setActiveIndex(index)}
                className={cn(
                  "flex h-7 w-full items-center gap-2 border-b border-border text-left text-[11px] transition-colors",
                  index === activeIndex
                    ? "border-l-2 border-l-orange bg-panel3 pl-[8px] text-ink-bright"
                    : "pl-2.5 text-ink",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-4 shrink-0 items-center rounded-[2px] border bg-transparent px-1.5 font-mono text-[9px] font-bold",
                    GROUP_CLASSES[command.group],
                  )}
                >
                  {command.group}
                </span>
                <span className="truncate">{command.label}</span>
                <span className="ml-auto shrink-0 font-mono text-[9px] text-ink-dim">
                  {command.hint}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-border bg-panel px-2.5 py-1 font-mono text-[9px] text-ink-dim">
          <span>↑↓ NAV • ENTER EXEC • ESC CLOSE • CTRL+K TOGGLE</span>
          <span className="text-orange">ERP CORE v1 — BLENDER EDITION</span>
        </div>
      </div>
    </div>
  );
}
