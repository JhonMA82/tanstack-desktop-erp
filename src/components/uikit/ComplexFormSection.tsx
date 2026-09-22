import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { DropZone } from "@/components/ui/DropZone";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { Slider } from "@/components/ui/Slider";
import { Textarea } from "@/components/ui/Textarea";

interface ComplexFormState {
  firstName: string;
  lastName: string;
  email: string;
  reference: string;
  salary: number;
  start: string;
  slot: string;
  notes: string;
}

const INITIAL: ComplexFormState = {
  firstName: "",
  lastName: "",
  email: "acme@corp.io",
  reference: "INV-2024-1248",
  salary: 42_000,
  start: "2024-11-01",
  slot: "09:00",
  notes: "",
};

/** Multi-section form: validation, disabled/readonly inputs, salary slider, date/time and drop zone. */
export function ComplexFormSection() {
  const { push } = useToast();
  const [form, setForm] = useState<ComplexFormState>(INITIAL);
  const [attached, setAttached] = useState<Array<{ id: string; name: string }>>([]);
  const [showErrors, setShowErrors] = useState(false);

  const set = <K extends keyof ComplexFormState>(key: K, value: ComplexFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const lastNameError = showErrors && form.lastName.trim() === "";

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (form.lastName.trim() === "") {
          setShowErrors(true);
          push({ kind: "ERROR", title: "VALIDATION", message: "Last name is required" });
          return;
        }
        setShowErrors(false);
        push({
          kind: "SUCCESS",
          title: "SAVED",
          message: `${form.firstName} ${form.lastName} — $${form.salary.toLocaleString("en-US")} • ${attached.length} attachment(s)`,
        });
      }}
    >
      <Panel title="Form • Complex — Identity" actions="REQUIRED / DISABLED / READONLY">
        <div className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-2">
          <Field label="First name" htmlFor="cf-first" hint="Letters only.">
            <Input
              id="cf-first"
              placeholder="Ada"
              value={form.firstName}
              onChange={(event) => set("firstName", event.target.value)}
            />
          </Field>
          <Field
            label="Last name"
            htmlFor="cf-last"
            error={lastNameError ? "Last name is required" : undefined}
          >
            <Input
              id="cf-last"
              placeholder="Lovelace"
              className={lastNameError ? "border-red" : undefined}
              value={form.lastName}
              onChange={(event) => set("lastName", event.target.value)}
            />
          </Field>
          <Field label="Email (disabled)" htmlFor="cf-email">
            <Input id="cf-email" value={form.email} disabled />
          </Field>
          <Field label="Reference (readonly)" htmlFor="cf-ref">
            <Input id="cf-ref" value={form.reference} readOnly />
          </Field>
          <Field label="Notes" htmlFor="cf-notes" className="sm:col-span-2">
            <Textarea
              id="cf-notes"
              placeholder="Optional context for this record…"
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Form • Complex — Compensation" actions="SLIDER • DATE • TIME">
        <div className="flex flex-col gap-2 p-2">
          <Field label="Salary (drag ↔)" htmlFor="cf-salary">
            <div className="flex items-center gap-3">
              <Slider
                id="cf-salary"
                aria-label="Salary"
                min={28_000}
                max={48_000}
                step={500}
                value={form.salary}
                onValueChange={(value) => set("salary", value)}
              />
              <span className="w-24 shrink-0 text-right font-mono text-[11px] font-bold text-ink">
                ${form.salary.toLocaleString("en-US")}
              </span>
            </div>
          </Field>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Start date" htmlFor="cf-start">
              <Input
                id="cf-start"
                type="date"
                value={form.start}
                onChange={(event) => set("start", event.target.value)}
              />
            </Field>
            <Field label="Time slot" htmlFor="cf-slot">
              <Input
                id="cf-slot"
                type="time"
                value={form.slot}
                onChange={(event) => set("slot", event.target.value)}
              />
            </Field>
          </div>
        </div>
      </Panel>

      <Panel title="Form • Complex — Documents" actions={`${attached.length} ATTACHED`}>
        <div className="flex flex-col gap-2 p-2">
          <DropZone
            onFiles={(files) => {
              const picked = Array.from(files).map((file) => ({
                id: crypto.randomUUID(),
                name: file.name,
              }));
              setAttached((current) => [...current, ...picked]);
              push({
                kind: "SUCCESS",
                title: "ATTACHED",
                message: `${picked.length} file(s) — ${picked[0]?.name ?? ""}`,
              });
            }}
          />
          {attached.length > 0 ? (
            <ul className="flex flex-col gap-0.5 font-mono text-[10px] text-ink-dim">
              {attached.slice(0, 5).map((file) => (
                <li key={file.id}>• {file.name}</li>
              ))}
            </ul>
          ) : null}
          <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setForm(INITIAL);
                setAttached([]);
                setShowErrors(false);
                push({ kind: "INFO", title: "DISCARDED", message: "Complex form reset" });
              }}
            >
              Discard
            </Button>
            <Button type="submit" variant="primary">
              Validate & save
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}
