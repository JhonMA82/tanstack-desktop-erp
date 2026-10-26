import { QueryStatePanel } from "./QueryStatePanel";

/**
 * Default pending UI of every route (`defaultPendingComponent`). Loaders usually
 * resolve from cache before paint, so this only shows on a cold, slow navigation
 * — rendered where the module would, with the shell still around it.
 */
export function ModulePending() {
  return <QueryStatePanel title="MODULE" state="pending" message="LOADING…" />;
}
