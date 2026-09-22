import type { ReactNode } from "react";
import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";

type ModalKind = "confirm" | "detail" | null;

const DETAIL_ROWS: Array<{ label: string; value: ReactNode }> = [
  { label: "Date", value: "2024-11-02" },
  { label: "Account", value: "4000 Sales" },
  { label: "Description", value: "Q4 Consulting Services — Retainer" },
  { label: "Amount", value: "$12,400.00" },
];

/** Confirm dialog (with required reason) and a detail dialog, both closable via ESC/backdrop/✕. */
export function ModalsSection() {
  const { push } = useToast();
  const [modal, setModal] = useState<ModalKind>(null);
  const [reason, setReason] = useState("");
  const close = () => setModal(null);

  return (
    <Panel title="Modals" actions="ESC • BACKDROP • ✕">
      <div className="flex flex-wrap items-center gap-2 p-2">
        <Button onClick={() => setModal("confirm")}>Open confirm</Button>
        <Button variant="primary" onClick={() => setModal("detail")}>
          Open detail
        </Button>
      </div>

      <Modal
        open={modal === "confirm"}
        onClose={close}
        title="Confirm action"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (reason.trim() === "") {
                  push({
                    kind: "ERROR",
                    title: "BLOCKED",
                    message: "Reason is required to continue",
                  });
                  return;
                }
                push({
                  kind: "SUCCESS",
                  title: "POSTED",
                  message: `6 docs posted to ledger — ${reason}`,
                });
                setReason("");
                close();
              }}
            >
              Post all
            </Button>
          </>
        }
      >
        <p className="text-[11px] text-ink">
          Post 6 documents to the ledger? This action cannot be undone.
        </p>
        <Field
          label="Reason (required)"
          htmlFor="md-reason"
          error={reason.trim() === "" ? "Cannot be empty" : undefined}
        >
          <Input
            id="md-reason"
            placeholder="Monthly close"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
      </Modal>

      <Modal
        open={modal === "detail"}
        onClose={close}
        title="INV-2024-1248 — ACME CORP / CLIENT A"
        footer={
          <Button variant="ghost" onClick={close}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col">
          {DETAIL_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-border/60 py-1.5 text-[11px]"
            >
              <span className="text-[10px] tracking-[0.06em] text-ink-dim uppercase">
                {row.label}
              </span>
              <span className="text-right font-mono text-ink">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-1.5 text-[11px]">
            <span className="text-[10px] tracking-[0.06em] text-ink-dim uppercase">Status</span>
            <StatusBadge status="POSTED" />
          </div>
        </div>
      </Modal>
    </Panel>
  );
}
