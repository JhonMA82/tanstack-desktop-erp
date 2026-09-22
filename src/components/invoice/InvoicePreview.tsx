import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { InvoiceTaxOption } from "@/lib/invoice";
import { useInvoiceEditor } from "./editor-context";
import {
  INVOICE_PAPER_HEIGHT,
  INVOICE_PAPER_WIDTH,
  InvoicePaper,
  type InvoicePaperProps,
} from "./InvoicePaper";
import { usePaperScale } from "./use-paper-scale";

export interface InvoicePreviewProps {
  taxOptions: InvoiceTaxOption[];
}

/**
 * Right column of the composer: the live document scaled into a dark canvas,
 * plus a hidden print portal so `window.print()` only emits the paper.
 */
export function InvoicePreview({ taxOptions }: InvoicePreviewProps) {
  const { values } = useInvoiceEditor();
  const { push } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const scale = usePaperScale(canvasRef, INVOICE_PAPER_WIDTH, 0.6);

  return (
    <>
      <InvoicePrintPortal values={values} taxOptions={taxOptions} />
      <Panel
        title="Preview"
        actions={
          <span className="flex gap-1">
            <Button size="sm" onClick={() => window.print()}>
              Print
            </Button>
            <Button
              size="sm"
              onClick={() =>
                push({
                  kind: "INFO",
                  title: "EXPORT PDF",
                  message: "Use the print dialog → Destination: Save as PDF",
                })
              }
            >
              PDF
            </Button>
          </span>
        }
      >
        <div
          ref={canvasRef}
          className="flex h-[560px] justify-center overflow-auto bg-panel3 p-4 print:hidden"
        >
          <div
            className="shrink-0"
            style={{ width: INVOICE_PAPER_WIDTH * scale, height: INVOICE_PAPER_HEIGHT * scale }}
          >
            <div
              style={{
                width: INVOICE_PAPER_WIDTH,
                height: INVOICE_PAPER_HEIGHT,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <InvoicePaper values={values} taxOptions={taxOptions} />
            </div>
          </div>
        </div>
      </Panel>
    </>
  );
}

/**
 * Renders the paper on `document.body` (outside `#root`) so the print CSS can
 * hide the whole application shell and print only the document.
 */
function InvoicePrintPortal({ values, taxOptions }: InvoicePaperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div data-print-root>
      <InvoicePaper values={values} taxOptions={taxOptions} />
    </div>,
    document.body,
  );
}
