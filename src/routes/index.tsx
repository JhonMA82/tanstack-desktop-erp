import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_MODULE_PATH } from "@/config/navigation";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: DEFAULT_MODULE_PATH });
  },
});
