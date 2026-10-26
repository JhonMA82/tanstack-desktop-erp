import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Module layout. Every module keeps this shape — a layout that renders its
 * `<Outlet/>` plus an `index` page for the module root — so a nested page can be
 * added later without rewriting the parent (`bun run gen page` relies on it).
 */
export const Route = createFileRoute("/home")({
  component: HomeLayout,
});

function HomeLayout() {
  return <Outlet />;
}
