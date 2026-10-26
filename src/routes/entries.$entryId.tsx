import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout of `/entries/$entryId`. It exists so the detail (index) and the edit page
 * can both live under the same segment: a route with children must render its
 * `<Outlet/>`, or the child silently never paints (the trap this base documents).
 */
export const Route = createFileRoute("/entries/$entryId")({
  component: EntryLayout,
});

function EntryLayout() {
  return <Outlet />;
}
