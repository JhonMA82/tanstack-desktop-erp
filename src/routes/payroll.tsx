import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/payroll")({
  component: PayrollPage,
});

function PayrollPage() {
  return <ModulePlaceholder id="payroll" />;
}
