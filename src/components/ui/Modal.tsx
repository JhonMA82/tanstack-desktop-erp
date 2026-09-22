import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  /** Closes the modal (backdrop click, ✕ button and Escape all call it). */
  onClose: () => void;
  /** Modal title; also used as the accessible name. */
  title: string;
  /** `wide` widens the dialog past the source's 720px default. */
  width?: "default" | "wide";
  /** Right-aligned footer content (action buttons). */
  footer?: ReactNode;
  children: ReactNode;
}

/** Modal matching the source `.modal*` styles (overlay, 28px head, body, 36px foot). */
export function Modal({ open, onClose, title, width = "default", footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[90vh] w-[720px] max-w-[95vw] flex-col overflow-hidden rounded-[2px] border border-border bg-panel shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
          width === "wide" && "w-[960px]",
        )}
      >
        <header className="flex h-7 min-h-7 items-center justify-between border-b border-border bg-panel2 px-2 text-[11px] font-bold tracking-[0.06em] uppercase">
          <span className="truncate">{title}</span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[2px] border border-border bg-panel2 font-mono text-[10px] font-bold text-ink-dim hover:border-orange hover:text-orange"
          >
            ✕
          </button>
        </header>
        <div className="flex flex-col gap-3 overflow-y-auto bg-panel p-3">{children}</div>
        {footer ? (
          <footer className="flex h-9 min-h-9 items-center justify-end gap-1.5 border-t border-border bg-panel2 px-2">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
