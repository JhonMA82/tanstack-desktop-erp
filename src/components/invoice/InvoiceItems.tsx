import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";
import { getLineAmount, type InvoiceLineItem, parseNumericInput } from "@/lib/invoice";
import { useInvoiceEditor } from "./editor-context";
import { SectionHeading } from "./SectionHeading";

/** Column layout shared by the header strip and every line row. */
const ROW_GRID =
  "grid grid-cols-[minmax(0,1fr)_56px_80px_88px_72px] items-center gap-2 max-sm:grid-cols-[minmax(0,1fr)_48px_72px_76px_68px]";

let nextItemId = 100;

/** Editable line items: add, reorder and remove rows, totals computed live. */
export function InvoiceItems() {
  const { values, patch } = useInvoiceEditor();

  const updateLine = (index: number, partial: Partial<InvoiceLineItem>) => {
    patch({
      items: values.items.map((item, position) =>
        position === index ? { ...item, ...partial } : item,
      ),
    });
  };

  const moveLine = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= values.items.length) {
      return;
    }
    const items = [...values.items];
    const [moved] = items.splice(index, 1);
    items.splice(target, 0, moved);
    patch({ items });
  };

  const removeLine = (index: number) => {
    patch({ items: values.items.filter((_, position) => position !== index) });
  };

  const addLine = () => {
    patch({
      items: [
        ...values.items,
        { id: `item-${nextItemId++}`, description: "", quantity: 1, unitPrice: 0 },
      ],
    });
  };

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading
        action={
          <Button size="sm" variant="ghost" onClick={addLine}>
            + Add Item
          </Button>
        }
      >
        Invoice Items
      </SectionHeading>

      <div className={ROW_GRID}>
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ink-dim">
          Description
        </span>
        <span className="text-right font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ink-dim">
          Units
        </span>
        <span className="text-right font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ink-dim">
          Unit Cost
        </span>
        <span className="text-right font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-ink-dim">
          Line Total
        </span>
        <span aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1.5">
        {values.items.map((item, index) => (
          <div key={item.id} className={ROW_GRID}>
            <Input
              aria-label={`Item ${index + 1} description`}
              placeholder="Describe the work"
              value={item.description}
              onChange={(event) => updateLine(index, { description: event.target.value })}
            />
            <Input
              aria-label={`Item ${index + 1} units`}
              className="text-right"
              type="number"
              min={0}
              step={1}
              value={Number.isFinite(item.quantity) ? String(item.quantity) : ""}
              onChange={(event) =>
                updateLine(index, { quantity: parseNumericInput(event.target.value) })
              }
            />
            <Input
              aria-label={`Item ${index + 1} unit cost`}
              className="text-right"
              type="number"
              min={0}
              step="0.01"
              value={Number.isFinite(item.unitPrice) ? String(item.unitPrice) : ""}
              onChange={(event) =>
                updateLine(index, { unitPrice: parseNumericInput(event.target.value) })
              }
            />
            <span className="text-right font-mono text-[11px] tabular-nums text-ink-bright">
              {formatCurrency(getLineAmount(item))}
            </span>
            <span className="flex items-center justify-end gap-1">
              <Button
                size="sm"
                aria-label={`Move item ${index + 1} up`}
                disabled={index === 0}
                onClick={() => moveLine(index, -1)}
              >
                ▲
              </Button>
              <Button
                size="sm"
                aria-label={`Move item ${index + 1} down`}
                disabled={index === values.items.length - 1}
                onClick={() => moveLine(index, 1)}
              >
                ▼
              </Button>
              <Button
                size="sm"
                variant="danger"
                aria-label={`Remove item ${index + 1}`}
                onClick={() => removeLine(index)}
              >
                ✕
              </Button>
            </span>
          </div>
        ))}
        {values.items.length === 0 ? (
          <p className="border border-dashed border-border p-3 text-center font-mono text-[10px] text-ink-dim">
            NO LINES — ADD AN ITEM TO START THE INVOICE
          </p>
        ) : null}
      </div>
    </section>
  );
}
