import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Settings is the base's nesting example: a layout that only renders its
 * `<Outlet/>`, an `index` page for `/settings` and a real child at
 * `/settings/preferences`. That is the shape `bun run gen page` produces.
 */
export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return <Outlet />;
}
