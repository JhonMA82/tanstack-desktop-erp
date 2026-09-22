/**
 * Lifecycle states shared by ledger documents (invoices, bills, expenses)
 * and rendered by the `StatusBadge` primitive.
 */
export type LedgerStatus = "POSTED" | "DRAFT" | "VOID" | "PENDING";
