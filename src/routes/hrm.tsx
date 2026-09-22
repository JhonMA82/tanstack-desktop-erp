import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export const Route = createFileRoute("/hrm")({
  component: HrmPage,
});

function HrmPage() {
  return <ModulePlaceholder id="hrm" />;
}
