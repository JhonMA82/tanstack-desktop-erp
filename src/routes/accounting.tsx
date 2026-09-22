import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/accounting")({
  component: AccountingPage,
});

function AccountingPage() {
  return <ModulePlaceholder id="accounting" />;
}
