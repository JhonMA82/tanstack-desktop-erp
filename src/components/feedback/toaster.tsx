import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { ToastViewport } from "./ToastViewport";

export type ToastKind = "SUCCESS" | "INFO" | "WARN" | "ERROR";

export interface ToastInput {
  /** Severity shown as the colored chip. */
  kind: ToastKind;
  /** Uppercase toast title (e.g. `EXPORTED`). */
  title: string;
  /** Supporting message. */
  message: string;
}

export interface ToastItem extends ToastInput {
  /** Unique instance id used as the React key and dismissal handle. */
  id: number;
}

interface ToastContextValue {
  /** Queues a toast; it auto-dismisses after `TOAST_DURATION_MS`. */
  push: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 4;
const TOAST_DURATION_MS = 4000;

/** Provides the toast queue used by the command palette and module actions. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current;
      nextId.current += 1;
      setToasts((list) => [...list, { ...toast, id }].slice(-MAX_TOASTS));
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** Reads the toast queue; throws when used outside of `ToastProvider`. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
