import { useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";

interface SimpleFormState {
  email: string;
  startDate: string;
  plan: string;
  notifications: boolean;
  role: string;
  twoFactor: boolean;
}

const INITIAL: SimpleFormState = {
  email: "",
  startDate: "",
  plan: "pro",
  notifications: true,
  role: "member",
  twoFactor: false,
};

/** Small controlled form: text/date/select, checkbox, radios, switch, submit + reset. */
export function SimpleFormSection() {
  const { push } = useToast();
  const [form, setForm] = useState<SimpleFormState>(INITIAL);

  const set = <K extends keyof SimpleFormState>(key: K, value: SimpleFormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Panel title="Form • Simple" actions="CONTROLLED">
      <form
        className="flex flex-col gap-2 p-2"
        onSubmit={(event) => {
          event.preventDefault();
          push({
            kind: "SUCCESS",
            title: "SAVED",
            message: `Profile saved — ${form.email || "no email"} • plan ${form.plan.toUpperCase()} • role ${form.role}`,
          });
        }}
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Email" htmlFor="sf-email" hint="We never share your email.">
            <Input
              id="sf-email"
              type="email"
              placeholder="acme@corp.io"
              value={form.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </Field>
          <Field label="Start date" htmlFor="sf-date">
            <Input
              id="sf-date"
              type="date"
              value={form.startDate}
              onChange={(event) => set("startDate", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Plan" htmlFor="sf-plan">
          <Select
            id="sf-plan"
            value={form.plan}
            className="w-full"
            onChange={(event) => set("plan", event.target.value)}
          >
            <option value="free">Free — 1 seat</option>
            <option value="pro">Pro — 12 seats</option>
            <option value="enterprise">Enterprise — unlimited</option>
          </Select>
        </Field>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Notifications">
            <Checkbox
              label="Email notifications"
              checked={form.notifications}
              onChange={(event) => set("notifications", event.target.checked)}
            />
          </Field>
          <Field label="Two-factor auth">
            <Switch
              checked={form.twoFactor}
              onCheckedChange={(value) => set("twoFactor", value)}
              label="TWO-FACTOR AUTH"
            />
          </Field>
        </div>
        <Field label="Role">
          <div className="flex items-center gap-4 py-1">
            {(["admin", "member", "viewer"] as const).map((role) => (
              <label
                key={role}
                className="flex cursor-pointer items-center gap-1.5 text-[11px] text-ink"
              >
                <input
                  type="radio"
                  name="sf-role"
                  className="size-3.5 cursor-pointer accent-orange"
                  checked={form.role === role}
                  onChange={() => set("role", role)}
                />
                {role}
              </label>
            ))}
          </div>
        </Field>
        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            variant="ghost"
            onClick={() => {
              setForm(INITIAL);
              push({ kind: "INFO", title: "RESET", message: "Form cleared" });
            }}
          >
            Reset
          </Button>
          <Button type="submit" variant="primary">
            Save profile
          </Button>
        </div>
      </form>
    </Panel>
  );
}
