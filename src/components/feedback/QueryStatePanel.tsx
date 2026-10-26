import type { ReactNode } from "react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

export interface QueryStatePanelProps {
  /** Panel header, e.g. `MODULE • ERROR`. */
  title: string;
  /** `error` paints the message red and announces it; `pending` stays dim and polite. */
  state: "pending" | "error";
  /** Status or error text shown in the body. */
  message: string;
  /** Trailing actions (RETRY, REINICIAR…). */
  actions?: ReactNode;
}

/**
 * The single loading/error body shared by routes and route boundaries, so a new
 * module never re-implements its own LOADING/ERROR panel.
 */
export function QueryStatePanel({ title, state, message, actions }: QueryStatePanelProps) {
  const isError = state === "error";

  return (
    <div className="p-2" role={isError ? "alert" : "status"}>
      <Panel title={title}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <span className={cn("font-mono text-[11px]", isError ? "text-red" : "text-ink-dim")}>
            {message}
          </span>
          {actions}
        </div>
      </Panel>
    </div>
  );
}
