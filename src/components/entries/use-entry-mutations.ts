import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/feedback/toaster";
import type { EntryInput, EntryRow } from "@/data/entries";
import { archiveEntry, createEntry, entriesQueryKey, updateEntry } from "@/data/entries";
import { errorMessage } from "@/lib/api";

/**
 * Write path of the module: one hook per mutation, all sharing the same shape —
 * invalidate the resource, toast the outcome, and let the page decide where to go
 * through `onDone`. Pages stay free of cache and error plumbing.
 */
function useInvalidateEntries() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: entriesQueryKey });
}

export function useCreateEntry(onDone?: (entry: EntryRow) => void) {
  const invalidate = useInvalidateEntries();
  const { push } = useToast();

  return useMutation({
    mutationFn: (input: EntryInput) => createEntry(input),
    onSuccess: (entry) => {
      void invalidate();
      push({ kind: "SUCCESS", title: "CREATED", message: `${entry.id} — ${entry.description}` });
      onDone?.(entry);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "CREATE FAILED", message: errorMessage(error) });
    },
  });
}

export function useUpdateEntry(onDone?: (entry: EntryRow) => void) {
  const invalidate = useInvalidateEntries();
  const { push } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EntryInput }) => updateEntry(id, input),
    onSuccess: (entry) => {
      void invalidate();
      push({ kind: "SUCCESS", title: "SAVED", message: `${entry.id} — updated` });
      onDone?.(entry);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "SAVE FAILED", message: errorMessage(error) });
    },
  });
}

export function useArchiveEntry(onDone?: (entry: EntryRow) => void) {
  const invalidate = useInvalidateEntries();
  const { push } = useToast();

  return useMutation({
    mutationFn: (id: string) => archiveEntry(id),
    onSuccess: (entry) => {
      void invalidate();
      push({ kind: "WARN", title: "ARCHIVED", message: `${entry.id} — kept in the ledger` });
      onDone?.(entry);
    },
    onError: (error) => {
      push({ kind: "ERROR", title: "ARCHIVE FAILED", message: errorMessage(error) });
    },
  });
}
