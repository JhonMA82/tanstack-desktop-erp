import { cn } from "@/lib/cn";
import type { ToastItem, ToastKind } from "./toaster";

const KIND_CLASSES: Record<ToastKind, string> = {
  SUCCESS: "border-green text-green",
  INFO: "border-blue text-blue",
  WARN: "border-orange text-orange",
  ERROR: "border-red text-red",
};

export interface ToastViewportProps {
  /** Currently queued toasts (newest at the bottom). */
  toasts: readonly ToastItem[];
  /** Dismisses a toast by id. */
  onDismiss: (id: number) => void;
}

/** Fixed bottom-right toast stack with colored chips and manual dismissal. */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-2 bottom-8 z-40 flex w-[300px] flex-col gap-1" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="rounded-[2px] border border-border bg-panel2 p-2"
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-4 items-center rounded-[2px] border bg-transparent px-1.5 font-mono text-[9px] font-bold",
                KIND_CLASSES[toast.kind],
              )}
            >
              {toast.kind}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-ink-bright">
              {toast.title}
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
              className="ml-auto font-mono text-[10px] text-ink-dim hover:text-ink-bright"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-[10px] leading-snug text-ink-dim">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
