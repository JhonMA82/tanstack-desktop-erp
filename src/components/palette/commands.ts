import type { ToastInput } from "@/components/feedback/toaster";
import type { ModulePath } from "@/config/navigation";
import { MODULES, pagesOf } from "@/config/navigation";

export type CommandGroup = "NAVIGATION" | "ACTIONS";

export interface CommandContext {
  /** Navigates to a registry path (module root or nested page). */
  navigate: (path: ModulePath) => void;
  /** Flips the theme. */
  toggleTheme: () => void;
  /** Queues a toast. */
  notify: (toast: ToastInput) => void;
  /** Closes the palette. */
  close: () => void;
}

export interface Command {
  /** Stable id used as the React key. */
  id: string;
  group: CommandGroup;
  /** Command label shown in the palette. */
  label: string;
  /** Right-aligned hint (route path or category). */
  hint: string;
  /** Executed on Enter or click. */
  run: (ctx: CommandContext) => void;
}

/**
 * Builds the command registry from the navigation config: one navigation command
 * per module and one per nested page, plus the shell actions. Adding a module or
 * a page in `src/config/navigation.ts` is enough for it to appear here.
 */
export function createCommands(): Command[] {
  const navigation: Command[] = MODULES.flatMap((module) => {
    const own: Command = {
      id: `go-${module.id}`,
      group: "NAVIGATION",
      label: `GO TO ${module.label}`,
      hint: module.path,
      run: (ctx) => {
        ctx.navigate(module.path);
        ctx.close();
      },
    };

    const pages: Command[] = pagesOf(module.id).map((page) => ({
      id: `go-${module.id}-${page.id}`,
      group: "NAVIGATION",
      label: `GO TO ${module.label} / ${page.label}`,
      hint: page.path,
      run: (ctx) => {
        ctx.navigate(page.path);
        ctx.close();
      },
    }));

    return [own, ...pages];
  });

  const actions: Command[] = [
    {
      id: "toggle-theme",
      group: "ACTIONS",
      label: "TOGGLE DARK MODE",
      hint: "APPEARANCE",
      run: (ctx) => {
        ctx.toggleTheme();
        ctx.close();
      },
    },
  ];

  return [...navigation, ...actions];
}
