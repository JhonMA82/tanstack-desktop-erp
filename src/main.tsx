import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ModuleError } from "@/components/feedback/RouteError";
import { ModulePending } from "@/components/feedback/RoutePending";
import { APP } from "@/config/app";
import { routeTree } from "./routeTree.gen";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const router = createRouter({
  routeTree,
  // Routes read the query client from `context` inside their loaders, so data
  // is awaited before the route renders instead of fetched after mount.
  context: { queryClient },
  scrollRestoration: true,
  defaultPreload: "intent",
  // Module failures keep the shell usable; the root route has its own fallback.
  defaultErrorComponent: ModuleError,
  defaultPendingComponent: ModulePending,
  defaultPendingMs: 300,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

// `index.html` carries a neutral fallback title; the brand owns the real one.
document.title = `${APP.name} v${APP.version}`;

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
