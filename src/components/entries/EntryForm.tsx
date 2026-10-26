import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/Button";
import { FormNumberField, FormSelectField, FormTextField } from "@/components/ui/FormField";
import { Panel } from "@/components/ui/Panel";
import type { EntryInput } from "@/data/entries";
import { entryInputSchema } from "@/data/entries";

/** Blank entry for the create page; the date starts at today. */
export function emptyEntry(): EntryInput {
  return {
    date: new Date().toISOString().slice(0, 10),
    description: "",
    account: "",
    amountCents: 0,
    status: "DRAFT",
  };
}

export interface EntryFormProps {
  /** Values the form starts with: blank for create, the stored row for edit. */
  defaultValues: EntryInput;
  submitLabel: string;
  /** Mutation in flight: disables the submit button. */
  isPending?: boolean;
  onSubmit: (input: EntryInput) => Promise<unknown>;
  onCancel: () => void;
}

/**
 * The reference form: TanStack Form validates with the same `zod` schema the data
 * layer uses, and `FormField` primitives wire the label, hint and field errors.
 */
export function EntryForm({
  defaultValues,
  submitLabel,
  isPending = false,
  onSubmit,
  onCancel,
}: EntryFormProps) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: entryInputSchema },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Panel title="Entry">
        <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2">
          <form.Field name="date">
            {(field) => (
              <FormTextField
                field={field}
                id="date"
                label="DATE"
                hint="YYYY-MM-DD"
                placeholder="2024-11-18"
              />
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <FormSelectField
                field={field}
                id="status"
                label="STATUS"
                options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "POSTED", label: "Posted" },
                ]}
              />
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <FormTextField
                field={field}
                id="description"
                label="DESCRIPTION"
                placeholder="Vendor invoice — cloud hosting"
              />
            )}
          </form.Field>

          <form.Field name="account">
            {(field) => (
              <FormTextField
                field={field}
                id="account"
                label="ACCOUNT"
                placeholder="6100 Software"
              />
            )}
          </form.Field>

          <form.Field name="amountCents">
            {(field) => (
              <FormNumberField
                field={field}
                id="amount"
                label="AMOUNT (USD)"
                hint="Stored as integer cents"
                step={0.01}
                placeholder="1250.50"
                toInput={(cents) => cents / 100}
                fromInput={(dollars) => Math.round(dollars * 100)}
              />
            )}
          </form.Field>
        </div>
      </Panel>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          CANCEL
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit || isSubmitting || isPending}
            >
              {isSubmitting || isPending ? "SAVING…" : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
