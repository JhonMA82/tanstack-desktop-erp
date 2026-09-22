import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { InvoiceTaxOption } from "@/lib/invoice";
import { parseNumericInput } from "@/lib/invoice";
import { useInvoiceEditor } from "./editor-context";
import { SectionHeading } from "./SectionHeading";

export interface InvoiceAdjustmentsProps {
  /** Tax options offered by the select (also used to resolve the draft rate). */
  taxOptions: InvoiceTaxOption[];
}

/** Tax rate and discount controls of the draft. */
export function InvoiceAdjustments({ taxOptions }: InvoiceAdjustmentsProps) {
  const { values, patch } = useInvoiceEditor();
  const discountUnit = values.discountType === "fixed" ? "$" : "%";

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>Adjustments</SectionHeading>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_1.2fr]">
        <Field label="Tax" htmlFor="inv-tax">
          <Select
            id="inv-tax"
            value={values.taxId}
            onChange={(event) => patch({ taxId: event.target.value })}
          >
            {taxOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} ({option.rate}%)
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-[1fr_84px] gap-2">
          <Field label="Discount Type" htmlFor="inv-discount-type">
            <Select
              id="inv-discount-type"
              value={values.discountType}
              onChange={(event) =>
                patch({ discountType: event.target.value === "percent" ? "percent" : "fixed" })
              }
            >
              <option value="fixed">Fixed amount</option>
              <option value="percent">Percent</option>
            </Select>
          </Field>
          <Field label={`Value (${discountUnit})`} htmlFor="inv-discount-value">
            <span className="relative flex">
              <Input
                id="inv-discount-value"
                className="pr-5 text-right"
                type="number"
                min={0}
                step="0.01"
                value={Number.isFinite(values.discountValue) ? String(values.discountValue) : ""}
                onChange={(event) =>
                  patch({ discountValue: parseNumericInput(event.target.value) })
                }
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-dim"
              >
                {discountUnit}
              </span>
            </span>
          </Field>
        </div>
      </div>
    </section>
  );
}
