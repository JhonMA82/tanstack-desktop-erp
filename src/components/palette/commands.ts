import type { ToastInput } from "@/components/feedback/toaster";
import type { ModulePath } from "@/lib/modules";
import { MODULES } from "@/lib/modules";

export type CommandGroup = "NAVIGATION" | "ACTIONS";

export interface CommandContext {
  /** Navigates to a module path. */
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
 * Builds the command registry: one navigation command per module plus
 * application actions (theme toggle, exports, drafts). Extend this list to
 * add palette commands; groups control the badge color in the palette.
 */
export function createCommands(): Command[] {
  const navigation: Command[] = MODULES.map((module) => ({
    id: `go-${module.id}`,
    group: "NAVIGATION",
    label: `GO TO ${module.label}`,
    hint: module.path,
    run: (ctx) => {
      ctx.navigate(module.path);
      ctx.close();
    },
  }));

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
    {
      id: "export-ledger-csv",
      group: "ACTIONS",
      label: "EXPORT LEDGER CSV",
      hint: "ACTION",
      run: (ctx) => {
        ctx.notify({
          kind: "SUCCESS",
          title: "EXPORTED",
          message: "Ledger CSV — 248 rows — ledger_2024-11-12.csv",
        });
        ctx.close();
      },
    },
    {
      id: "new-invoice-draft",
      group: "ACTIONS",
      label: "NEW INVOICE",
      hint: "ACTION",
      run: (ctx) => {
        ctx.notify({
          kind: "INFO",
          title: "SAVED",
          message: "Invoice INV-2024-1248 saved as draft",
        });
        ctx.close();
      },
    },
    {
      id: "post-all-invoices",
      group: "ACTIONS",
      label: "POST ALL INVOICES",
      hint: "ACTION",
      run: (ctx) => {
        ctx.notify({
          kind: "WARN",
          title: "POSTING",
          message: "Select rows to post",
        });
        ctx.close();
      },
    },
  ];

  return [...navigation, ...actions];
}
