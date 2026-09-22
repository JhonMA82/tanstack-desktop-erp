import { useQuery } from "@tanstack/react-query";
import { dashboardQueryOptions } from "@/data/dashboard";
import { useShell } from "./shell-context";

/**
 * Row count for the active module as shown in the viewport header and status
 * bar. Only the Dashboard ships data in the base scaffold; other modules
 * report `—` until migrated.
 */
export function useModuleRows(): string {
  const { activeModule } = useShell();
  const { data } = useQuery(dashboardQueryOptions);
  if (activeModule.id !== "dashboard") {
    return "—";
  }
  return String(data?.transactions.length ?? 0);
}
