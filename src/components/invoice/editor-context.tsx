import { createContext, type ReactNode, useContext } from "react";
import type { InvoiceValues } from "@/lib/invoice";

/**
 * Editing session shared by the composer sections — the plain-React equivalent
 * of the reference example's `FormProvider`/`useFormContext` pair: one draft
 * object plus a shallow merge, no form library involved.
 */
export interface InvoiceEditor {
  /** Current draft values (already watched by the preview). */
  values: InvoiceValues;
  /** Shallow-merges a partial update into the draft. */
  patch: (partial: Partial<InvoiceValues>) => void;
}

const InvoiceEditorContext = createContext<InvoiceEditor | null>(null);

export interface InvoiceEditorProviderProps {
  editor: InvoiceEditor;
  children: ReactNode;
}

/** Publishes the draft to every section below it. */
export function InvoiceEditorProvider({ editor, children }: InvoiceEditorProviderProps) {
  return <InvoiceEditorContext.Provider value={editor}>{children}</InvoiceEditorContext.Provider>;
}

/** Reads the invoice draft; throws when used outside `InvoiceEditorProvider`. */
export function useInvoiceEditor(): InvoiceEditor {
  const ctx = useContext(InvoiceEditorContext);
  if (!ctx) {
    throw new Error("useInvoiceEditor must be used within InvoiceEditorProvider");
  }
  return ctx;
}
