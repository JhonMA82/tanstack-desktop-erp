import { cn } from "@/lib/cn";
import type { LedgerStatus } from "@/lib/ledger";

/** Accent color per ledger status, using design system tokens. */
const STATUS_COLORS: Record<LedgerStatus, string> = {
  POSTED: "var(--green)",
  DRAFT: "var(--orange)",
  VOID: "var(--red)",
  PENDING: "var(--blue)",
};

export interface StatusBadgeProps {
  status: LedgerStatus;
  className?: string;
}

/** Status chip mirroring the original ERP badge (colored border with a 2px accent edge). */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-flex h-4 items-center rounded-[2px] border bg-transparent px-[5px] font-mono text-[9px] font-bold uppercase tracking-[0.06em]",
        className,
      )}
      style={{ borderColor: color, color, borderLeftWidth: 2 }}
    >
      {status}
    </span>
  );
}
