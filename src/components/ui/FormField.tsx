import type { AnyFieldApi } from "@tanstack/react-form";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";

/**
 * First error of a field as plain text. TanStack Form yields Standard Schema issues
 * for schema validators and strings for function validators; the `Field` primitive
 * only needs the message.
 */
export function fieldError(field: AnyFieldApi): string | undefined {
  const error: unknown = field.state.meta.errors[0];
  if (!error) {
    return undefined;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

interface BaseFieldProps {
  /** Field API from `form.Field`'s render prop. */
  field: AnyFieldApi;
  /** Strip label above the control. */
  label: string;
  /** Control id, also used by the label's `htmlFor`. */
  id: string;
  hint?: string;
  placeholder?: string;
}

export interface FormTextFieldProps extends BaseFieldProps {}

/** Text input bound to a TanStack Form field, with its label, hint and error. */
export function FormTextField({ field, label, id, hint, placeholder }: FormTextFieldProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={fieldError(field)}>
      <Input
        id={id}
        name={field.name}
        value={String(field.state.value ?? "")}
        placeholder={placeholder}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
      />
    </Field>
  );
}

export interface FormNumberFieldProps extends BaseFieldProps {
  /** Value written to the form: integer cents for money, plain numbers otherwise. */
  step?: number;
  /** Form value -> what the input shows (e.g. cents -> dollars). */
  toInput?: (value: number) => number;
  /** What the user typed -> form value (e.g. dollars -> cents). */
  fromInput?: (value: number) => number;
}

/** Numeric input: keeps the form value a number instead of the input's string. */
export function FormNumberField({
  field,
  label,
  id,
  hint,
  placeholder,
  step = 1,
  toInput = (value) => value,
  fromInput = (value) => value,
}: FormNumberFieldProps) {
  const stored = Number(field.state.value);
  const shown = Number.isFinite(stored) ? toInput(stored) : Number.NaN;

  return (
    <Field label={label} htmlFor={id} hint={hint} error={fieldError(field)}>
      <Input
        id={id}
        name={field.name}
        type="number"
        step={step}
        value={Number.isFinite(shown) ? String(shown) : ""}
        placeholder={placeholder}
        onChange={(event) => field.handleChange(fromInput(Number(event.target.value)))}
        onBlur={field.handleBlur}
      />
    </Field>
  );
}

export interface FormSelectOption<T extends string> {
  value: T;
  label: string;
}

export interface FormSelectFieldProps<T extends string> extends BaseFieldProps {
  options: FormSelectOption<T>[];
}

/** Select bound to a TanStack Form field. */
export function FormSelectField<T extends string>({
  field,
  label,
  id,
  hint,
  options,
}: FormSelectFieldProps<T>) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={fieldError(field)}>
      <Select
        id={id}
        name={field.name}
        value={String(field.state.value ?? "")}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
}
