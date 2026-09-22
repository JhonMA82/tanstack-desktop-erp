import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useInvoiceEditor } from "./editor-context";
import { SectionHeading } from "./SectionHeading";

/** Reference number and issue/due dates of the draft. */
export function InvoiceDetails() {
  const { values, patch } = useInvoiceEditor();

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading>Invoice Details</SectionHeading>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Field label="Reference" htmlFor="inv-reference">
          <Input
            id="inv-reference"
            value={values.referenceNumber}
            onChange={(event) => patch({ referenceNumber: event.target.value })}
          />
        </Field>
        <Field label="Issued Date" htmlFor="inv-issued">
          <Input
            id="inv-issued"
            type="date"
            value={values.issuedDate}
            onChange={(event) => patch({ issuedDate: event.target.value })}
          />
        </Field>
        <Field label="Due Date" htmlFor="inv-due">
          <Input
            id="inv-due"
            type="date"
            value={values.paymentDueDate}
            onChange={(event) => patch({ paymentDueDate: event.target.value })}
          />
        </Field>
      </div>
    </section>
  );
}
