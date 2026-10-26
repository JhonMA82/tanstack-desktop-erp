import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout of the ENTRIES module; the list, the forms and the detail render inside. */
export const Route = createFileRoute("/entries")({
  component: EntriesLayout,
});

function EntriesLayout() {
  return <Outlet />;
}
