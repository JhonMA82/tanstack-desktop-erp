import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import type { InvoiceParty } from "@/lib/invoice";
import { useInvoiceEditor } from "./editor-context";
import { SectionHeading } from "./SectionHeading";

export interface ClientSelectorProps {
  /** Clients offered by the select; the chosen one is copied into the draft. */
  clients: InvoiceParty[];
}

/** "Billed To" section: client select plus the selected party's readout. */
export function ClientSelector({ clients }: ClientSelectorProps) {
  const { values, patch } = useInvoiceEditor();
  const { push } = useToast();
  const selected = values.to;

  return (
    <section className="flex flex-col gap-2">
      <SectionHeading
        action={
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              push({
                kind: "INFO",
                title: "CLIENT MANAGER",
                message: "New client form — not part of this example",
              })
            }
          >
            + Add Client
          </Button>
        }
      >
        Billed To
      </SectionHeading>

      <Field label="Client" htmlFor="inv-client">
        <Select
          id="inv-client"
          value={selected.id}
          onChange={(event) => {
            const next = clients.find((client) => client.id === event.target.value);
            if (next) {
              patch({ to: next });
            }
          }}
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 gap-x-3 font-mono text-[10px] text-ink-dim sm:grid-cols-2">
        <span className="truncate">{selected.email}</span>
        <span className="truncate">TAX ID: {selected.taxId}</span>
        <span className="sm:col-span-2">{selected.addressLines.join(" · ")}</span>
      </div>
    </section>
  );
}
