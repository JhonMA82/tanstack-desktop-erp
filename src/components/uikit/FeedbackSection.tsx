import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Slider } from "@/components/ui/Slider";

/** Toast triggers for the four severities plus indeterminate/determinate progress. */
export function FeedbackSection() {
  const { push } = useToast();
  const [progress, setProgress] = useState(64);

  return (
    <Panel title="Feedback" actions="TOASTS • PROGRESS">
      <div className="flex flex-col gap-3 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            onClick={() =>
              push({
                kind: "SUCCESS",
                title: "EXPORTED",
                message: "Ledger CSV — 248 rows — ledger_2024-11-12.csv",
              })
            }
          >
            Success toast
          </Button>
          <Button
            onClick={() =>
              push({ kind: "INFO", title: "NEW BILL", message: "Bill composer — BILL-2024-090" })
            }
          >
            Info toast
          </Button>
          <Button
            onClick={() =>
              push({ kind: "WARN", title: "NO SELECTION", message: "Select rows to post" })
            }
          >
            Warn toast
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              push({
                kind: "ERROR",
                title: "FAILED",
                message: "Could not post INV-2024-1246 — trial balance off by $400",
              })
            }
          >
            Error toast
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] tracking-[0.08em] text-ink-dim uppercase">
            Progress • Indeterminate
          </span>
          <ProgressBar indeterminate />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] tracking-[0.08em] text-ink-dim uppercase">
            Progress • {progress}% (driven by slider)
          </span>
          <ProgressBar value={progress} />
          <Slider
            aria-label="Progress value"
            min={0}
            max={100}
            value={progress}
            onValueChange={setProgress}
            className="max-w-64"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[9px] tracking-[0.08em] text-ink-dim uppercase">
            Progress • Thick 4px
          </span>
          <ProgressBar value={28} className="h-1" />
        </div>
      </div>
    </Panel>
  );
}
