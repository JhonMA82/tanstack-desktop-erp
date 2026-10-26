import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { QueryStatePanel } from "@/components/feedback/QueryStatePanel";
import { Button } from "@/components/ui/Button";
import { errorMessage } from "@/lib/api";

/**
 * Default error boundary of every module route (`defaultErrorComponent`). It
 * replaces only the route component, inside the shell `<Outlet>`, so the menu,
 * outliner and status bar stay usable while one module fails.
 */
export function ModuleError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  const retry = () => {
    // `reset` alone keeps the failed loader result: re-run it too.
    reset();
    void router.invalidate();
  };

  return (
    <QueryStatePanel
      title="MODULE • ERROR"
      state="error"
      message={errorMessage(error)}
      actions={<Button onClick={retry}>RETRY</Button>}
    />
  );
}

/**
 * Error boundary of the root route (`errorComponent` in `__root.tsx`): the shell
 * itself failed, so there is no navigation left — standalone chrome, one action.
 */
export function ShellError({ error }: ErrorComponentProps) {
  return (
    <div className="flex h-dvh w-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-[560px]">
        <QueryStatePanel
          title="APPLICATION • ERROR"
          state="error"
          message={errorMessage(error)}
          actions={<Button onClick={() => window.location.reload()}>RESTART</Button>}
        />
      </div>
    </div>
  );
}
