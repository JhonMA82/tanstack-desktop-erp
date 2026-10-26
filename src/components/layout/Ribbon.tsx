import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Icon } from "@/components/ui/Icon";
import { Menu, type MenuItem } from "@/components/ui/Menu";
import type { ActionBehavior, MenuAction, RibbonAction, RibbonGroup } from "@/config/navigation";
import { pagesOf } from "@/config/navigation";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";
import { useShell } from "./shell-context";

/** Icon used by the derived `Pages` group (one button per nested route). */
const PAGE_ICON: IconName = "folder";

/**
 * Blender-style ribbon (96px, collapsible to 28px). It renders whatever the
 * active module declares in `src/config/navigation.ts` — groups in order, then a
 * `Pages` group derived from `module.pages` — and runs the declared behavior
 * (navigate / toast / shell command). There is no per-module branch here.
 */
export function Ribbon() {
  const { activeModule, ribbonCollapsed, toggleTheme, toggleRibbon, setPaletteOpen } = useShell();
  const { push } = useToast();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const run = (behavior: ActionBehavior) => {
    if (behavior.to) {
      void navigate({ to: behavior.to });
      return;
    }
    if (behavior.notify) {
      push(behavior.notify);
      return;
    }
    if (behavior.command === "toggle-theme") {
      toggleTheme();
    } else if (behavior.command === "toggle-ribbon") {
      toggleRibbon();
    } else if (behavior.command === "open-palette") {
      setPaletteOpen(true);
    }
  };

  const groups = ribbonGroups(activeModule.id, activeModule.ribbon ?? []);

  if (ribbonCollapsed) {
    const hints = groups.map((group) => group.label.toUpperCase()).join(" • ");
    return (
      <div className="flex h-7 min-h-7 items-center overflow-x-auto border-b border-border bg-panel px-3 font-mono text-[9px] whitespace-nowrap text-ink-dim">
        <span className="flex gap-4">
          {activeModule.label} — RIBBON COLLAPSED • CLICK EXPAND{hints ? ` • ${hints}` : ""}
        </span>
      </div>
    );
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <RibbonRow>
      {groups.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 ? <RibbonSep /> : null}
          <RibbonGroupView group={group} pathname={pathname} onActivate={run} />
        </Fragment>
      ))}
    </RibbonRow>
  );
}

/**
 * The module's declared groups plus the derived `Pages` group, so adding a nested
 * route (`bun run gen page`) is enough for it to appear in the ribbon.
 *
 * Height budget: a group fills the 75px of usable height — three rows of small
 * buttons (3 × 22 + 2 × 2 = 70) or one row of 58px tiles. A group that would leave
 * a hole gets tiles: with one or two actions, small rows would float inside an
 * empty column (that was the empty slot next to `PAGES`).
 */
function ribbonGroups(moduleId: string, groups: RibbonGroup[]): RibbonGroup[] {
  const pages = pagesOf(moduleId);
  const all = [...groups];

  if (pages.length > 0) {
    // Up to three pages become tiles that fill the row; beyond that they stack in
    // two columns of small buttons (3 rows = 70px, the most the row holds).
    const asTiles = pages.length <= 3;

    all.push({
      label: "Pages",
      columns: asTiles ? 1 : 2,
      actions: pages.map((page) => ({
        id: `page-${page.id}`,
        size: asTiles ? "large" : "small",
        icon: PAGE_ICON,
        label: page.label,
        to: page.path,
      })),
    });
  }

  return all.filter((group) => group.actions.length > 0);
}

/**
 * The row is as tall as its content: 4px above the actions, the tallest group's
 * actions, 4px below and the 16px caption. A fixed 96px row left that slack under
 * the buttons, so a group with one tile showed ~17px of dead air above its caption
 * while the space above the tile was 4px.
 */
function RibbonRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-stretch overflow-x-auto border-b border-border bg-panel">
      {children}
    </div>
  );
}

interface RibbonGroupViewProps {
  group: RibbonGroup;
  pathname: string;
  onActivate: (behavior: ActionBehavior) => void;
}

function RibbonGroupView({ group, pathname, onActivate }: RibbonGroupViewProps) {
  return (
    <div className="relative flex min-w-[80px] shrink-0 flex-col px-2 pt-1">
      <div
        className={cn(
          // Centred: the group is often wider than its buttons (the caption sets
          // the width), and a left-aligned tile left the extra air on one side only.
          "flex flex-1 items-start justify-center gap-1.5 pb-1",
          group.columns === 2 && "grid grid-cols-2 justify-items-center",
        )}
      >
        {group.actions.map((action) =>
          action.size === "large" ? (
            <LargeButton
              key={action.id}
              action={action}
              pathname={pathname}
              onActivate={onActivate}
            />
          ) : (
            <SmallAction
              key={action.id}
              action={action}
              pathname={pathname}
              onActivate={onActivate}
            />
          ),
        )}
      </div>
      <div className="-mx-2 flex h-4 shrink-0 items-center justify-center border-t border-border px-2 font-mono text-[9px] uppercase tracking-[0.08em] text-ink-dim">
        {group.label}
      </div>
    </div>
  );
}

function RibbonSep() {
  return <div className="w-px shrink-0 self-stretch bg-border" aria-hidden="true" />;
}

interface ActionProps {
  pathname: string;
  onActivate: (behavior: ActionBehavior) => void;
}

interface LargeButtonProps extends ActionProps {
  action: RibbonAction;
}

function LargeButton({ action, pathname, onActivate }: LargeButtonProps) {
  const [line1, line2] = action.label.split("\n");
  const highlighted = action.tone === "accent";

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => onActivate(action)}
        className={cn(
          // Width follows the label (min 48px): a fixed 48px tile pushed a long
          // single-word label like PREFERENCES outside its own border.
          "flex h-[58px] min-w-12 cursor-pointer flex-col items-center justify-center gap-[3px] rounded-[2px] border px-1 transition-colors",
          highlighted
            ? "border-orange bg-panel3 text-ink-bright"
            : "border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink",
        )}
      >
        <span
          className={cn(
            "flex size-[22px] items-center justify-center rounded-[2px] border bg-panel2",
            highlighted ? "border-orange text-orange" : "border-border",
          )}
        >
          <Icon name={action.icon} size={action.iconSize ?? 14} />
        </span>
        {/* Fixed two-line box: a one-line label keeps the icon on the same baseline
            as its neighbours instead of re-centering the tile. */}
        <span className="flex h-5 flex-col items-center text-center text-[9px] leading-[10px] font-bold uppercase tracking-[0.02em]">
          <span className="whitespace-nowrap">{line1}</span>
          {line2 ? <span className="whitespace-nowrap">{line2}</span> : null}
        </span>
      </button>
      {action.menu && action.menu.length > 0 ? (
        <span className="absolute top-[6px] left-[calc(50%+2px)]">
          <Menu
            label={action.label.replace("\n", " ")}
            variant="chevron"
            items={toMenuItems(action.menu, pathname, onActivate)}
          />
        </span>
      ) : null}
    </div>
  );
}

interface SmallActionProps extends ActionProps {
  action: RibbonAction;
}

/** Small actions with variants use the pill menu trigger; the rest are plain buttons. */
function SmallAction({ action, pathname, onActivate }: SmallActionProps) {
  if (action.menu && action.menu.length > 0) {
    return (
      <Menu
        label={action.label}
        variant="pill"
        className="min-w-[78px]"
        text={action.label}
        items={toMenuItems(action.menu, pathname, onActivate)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => onActivate(action)}
      style={action.tall ? { height: 58 } : undefined}
      className={cn(
        "flex h-[22px] min-w-[78px] cursor-pointer items-center gap-1.5 rounded-[2px] border px-1.5 text-[10px] font-semibold tracking-[0.04em] uppercase transition-colors",
        action.tone === "danger"
          ? "border-transparent text-red hover:border-border hover:bg-panel3"
          : "border-transparent text-ink-dim hover:border-border hover:bg-panel3 hover:text-ink",
      )}
    >
      <Icon name={action.icon} size={action.iconSize ?? 10} />
      {action.label}
    </button>
  );
}

/** Maps declarative menu entries to the primitive, deriving `active` from the route. */
function toMenuItems(
  actions: MenuAction[],
  pathname: string,
  onActivate: (behavior: ActionBehavior) => void,
): MenuItem[] {
  return actions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    active: action.to ? action.to === pathname : undefined,
    onSelect: () => onActivate(action),
  }));
}
