import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";
import { useShell } from "./shell-context";

/**
 * Blender-style ribbon (84px, collapsible to 28px) with the groups extracted
 * from the source bundle: ACCOUNTING (Document/Actions/Ledger/View—Period),
 * HRM (Employee/Actions/Payroll/View) and the shared
 * Metrics/View—Range groups used by DASHBOARD, PAYROLL, INVENTORY,
 * REPORTS and SETTINGS. Buttons fire the original toasts or stay inert
 * exactly like the source.
 */
export function Ribbon() {
  const { activeModule, ribbonCollapsed, period, cyclePeriod, view, setView } = useShell();
  const { push } = useToast();
  const navigate = useNavigate();
  const [employeeFilter, setEmployeeFilter] = useState<string>("ALL");

  if (ribbonCollapsed) {
    return (
      <div className="flex h-7 min-h-7 items-center overflow-x-auto border-b border-border bg-panel px-3 font-mono text-[9px] whitespace-nowrap text-ink-dim">
        <span className="flex gap-4">
          {activeModule.label} — RIBBON COLLAPSED • CLICK EXPAND • DOCUMENT • ACTIONS • LEDGER •
          VIEW
        </span>
      </div>
    );
  }

  const periodDrop = <PeriodDrop period={period} onCycle={cyclePeriod} />;

  if (activeModule.id === "accounting") {
    return (
      <RibbonRow>
        <RibbonGroup label="Document">
          <LargeButton
            icon="invoice"
            line1="New"
            line2="Invoice"
            accent
            onClick={() =>
              push({
                kind: "INFO",
                title: "NEW INVOICE",
                message: "Invoice composer — INV-2024-1249",
              })
            }
          />
          <div className="flex flex-col gap-0.5">
            <SmallButton
              icon="bill"
              onClick={() =>
                push({ kind: "INFO", title: "NEW BILL", message: "Bill composer — BILL-2024-090" })
              }
            >
              New Bill
            </SmallButton>
            <SmallButton
              icon="expense"
              onClick={() =>
                push({
                  kind: "INFO",
                  title: "NEW EXPENSE",
                  message: "Expense composer — EXP-2024-157 — $0.00",
                })
              }
            >
              New Expense
            </SmallButton>
            <SmallButton
              icon="dupe"
              onClick={() =>
                push({
                  kind: "INFO",
                  title: "CREDIT NOTE",
                  message: "Credit Note — CN-2024-013 — $400.00 adjustment",
                })
              }
            >
              Credit Note
            </SmallButton>
          </div>
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="Actions">
          <div className="flex flex-col gap-0.5">
            <SmallButton
              icon="post"
              onClick={() =>
                push({ kind: "WARN", title: "NO SELECTION", message: "Select rows to post" })
              }
            >
              Post
            </SmallButton>
            <SmallButton icon="void" danger>
              Void
            </SmallButton>
            <SmallButton icon="dupe">Duplicate</SmallButton>
            <SmallButton icon="archive">Archive</SmallButton>
          </div>
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="Ledger">
          <LargeButton
            icon="ledger"
            line1="Journal"
            line2="Ledger"
            active={view === "LEDGER"}
            onClick={() => setView("LEDGER")}
          />
          <LargeButton
            icon="aging"
            line1="Aging"
            line2="Report"
            onClick={() =>
              push({
                kind: "INFO",
                title: "AGING",
                message: "Aging report generated — $42,128 receivables",
              })
            }
          />
          <LargeButton icon="recon" line1="Recon" line2="cile" />
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="View — Period">
          <LargeButton
            icon="grid"
            line1="Grid"
            line2="View"
            active={view === "GRID"}
            onClick={() => setView("GRID")}
          />
          <LargeButton
            icon="chart"
            line1="State"
            line2="ments"
            active={view === "STATEMENTS"}
            onClick={() => setView("STATEMENTS")}
          />
          <div className="flex flex-col gap-1">
            {periodDrop}
            <SmallButton icon="filter" active={view === "LEDGER"} onClick={() => setView("LEDGER")}>
              Filter
            </SmallButton>
          </div>
        </RibbonGroup>
      </RibbonRow>
    );
  }

  if (activeModule.id === "hrm") {
    return (
      <RibbonRow>
        <RibbonGroup label="Employee">
          <LargeButton
            icon="plus"
            line1="New"
            line2="Hire"
            accent
            onClick={() =>
              push({ kind: "INFO", title: "NEW HIRE", message: "Employee composer — EMP-009" })
            }
          />
          <div className="flex flex-col gap-0.5">
            <SmallButton icon="import">Import CSV</SmallButton>
            <SmallButton icon="team">Directory</SmallButton>
            <SmallButton icon="board">Org Chart</SmallButton>
          </div>
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="Actions">
          <div className="flex flex-col gap-0.5">
            <SmallButton icon="post">Promote</SmallButton>
            <SmallButton icon="void" danger>
              Terminate
            </SmallButton>
            <SmallButton icon="leave">Leave Req</SmallButton>
          </div>
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="Payroll">
          <LargeButton
            icon="payroll"
            line1="Run"
            line2="Payroll"
            onClick={() => void navigate({ to: "/payroll" })}
          />
          <LargeButton icon="bill" line1="Pay" line2="slips" />
          <LargeButton icon="aging" line1="Deduc" line2="tions" />
        </RibbonGroup>
        <RibbonSep />
        <RibbonGroup label="View">
          <LargeButton
            icon="dot"
            line1="Active"
            line2="39"
            active={employeeFilter === "ACTIVE"}
            onClick={() => setEmployeeFilter("ACTIVE")}
          />
          <LargeButton
            icon="leave"
            size={12}
            line1="On Leave"
            line2="02"
            active={employeeFilter === "ON LEAVE"}
            onClick={() => setEmployeeFilter("ON LEAVE")}
          />
          <LargeButton
            icon="archive"
            size={12}
            line1="Archived"
            line2="01"
            active={employeeFilter === "ARCHIVED"}
            onClick={() => setEmployeeFilter("ARCHIVED")}
          />
          <SmallButton
            icon="list"
            tall
            active={employeeFilter === "ALL"}
            onClick={() => setEmployeeFilter("ALL")}
          >
            ALL
          </SmallButton>
        </RibbonGroup>
      </RibbonRow>
    );
  }

  // DASHBOARD, PAYROLL, INVENTORY, REPORTS and SETTINGS share these groups.
  return (
    <RibbonRow>
      <RibbonGroup label={activeModule.label}>
        <LargeButton icon="chart" line1="Metrics" line2="Live" active />
        <div className="flex flex-col gap-0.5">
          <SmallButton icon="export">Export</SmallButton>
          <SmallButton icon="filter">Filter ▾</SmallButton>
        </div>
      </RibbonGroup>
      <RibbonSep />
      <RibbonGroup label="View — Range">
        <div className="flex flex-col gap-1">
          {periodDrop}
          <SmallButton icon="hist">Histogram</SmallButton>
        </div>
        <LargeButton
          icon="grid"
          line1="Grid"
          line2="View"
          active={view === "GRID"}
          onClick={() => setView("GRID")}
        />
        <LargeButton
          icon="ledger"
          line1="Ledger"
          line2="View"
          active={view === "LEDGER"}
          onClick={() => setView("LEDGER")}
        />
      </RibbonGroup>
    </RibbonRow>
  );
}

function RibbonRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[84px] min-h-[84px] items-stretch overflow-x-auto border-b border-border bg-panel transition-[height] duration-100">
      {children}
    </div>
  );
}

function RibbonGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative flex min-w-[80px] shrink-0 flex-col px-2 pt-1">
      <div className="flex flex-1 items-start gap-1.5 pb-1">{children}</div>
      <div className="-mx-2 flex h-4 shrink-0 items-center justify-center border-t border-border px-2 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-dim">
        {label}
      </div>
    </div>
  );
}

function RibbonSep() {
  return <div className="w-px shrink-0 self-stretch bg-border" aria-hidden="true" />;
}

interface LargeButtonProps {
  icon: IconName;
  line1: string;
  line2: string;
  /** Orange-bordered primary state (`.accent` mirrors the source's always-on orange buttons). */
  accent?: boolean;
  active?: boolean;
  /** Icon size inside the 22px box (source uses 14, some filters use 12). */
  size?: number;
  onClick?: () => void;
}

function LargeButton({
  icon,
  line1,
  line2,
  accent = false,
  active = false,
  size = 14,
  onClick,
}: LargeButtonProps) {
  const highlighted = accent || active;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[58px] w-12 min-w-12 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[2px] border transition-colors",
        highlighted
          ? "border-orange bg-panel3 text-ink-bright"
          : "border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink",
      )}
    >
      <span
        className={cn(
          "flex size-[22px] items-center justify-center rounded-[2px] border bg-panel2",
          highlighted ? "border-orange text-orange" : "border-border",
        )}
      >
        <Icon name={icon} size={size} />
      </span>
      <span className="text-center text-[9px] leading-[10px] font-bold uppercase tracking-[0.02em]">
        {line1}
        <br />
        {line2}
      </span>
    </button>
  );
}

interface SmallButtonProps {
  icon: IconName;
  children: ReactNode;
  active?: boolean;
  danger?: boolean;
  /** 58px tall variant used by the HRM `ALL` button. */
  tall?: boolean;
  onClick?: () => void;
}

function SmallButton({
  icon,
  children,
  active = false,
  danger = false,
  tall = false,
  onClick,
}: SmallButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={tall ? { height: 58 } : undefined}
      className={cn(
        "flex h-[22px] min-w-[78px] cursor-pointer items-center gap-1.5 rounded-[2px] border px-1.5 text-[10px] font-semibold tracking-[0.04em] uppercase transition-colors",
        active
          ? "border-orange bg-panel3 text-ink-bright"
          : danger
            ? "border-transparent text-red hover:border-border hover:bg-panel3"
            : "border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink",
      )}
    >
      <Icon name={icon} size={10} />
      {children}
    </button>
  );
}

function PeriodDrop({ period, onCycle }: { period: string; onCycle: () => void }) {
  return (
    <button
      type="button"
      onClick={onCycle}
      className="flex h-[22px] min-w-24 cursor-pointer items-center justify-between gap-1.5 rounded-[2px] border border-border bg-panel2 px-1.5 font-mono text-[10px] text-ink hover:border-border-l"
    >
      {period} ▾
    </button>
  );
}
