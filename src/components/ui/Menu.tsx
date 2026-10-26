import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, Ref } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";

export interface MenuItem {
  id: string;
  label: string;
  /** Leading icon; without one the item shows a check slot. */
  icon?: IconName;
  /**
   * Marks the current choice. Setting it turns the item into a `menuitemradio`
   * with `aria-checked`; leaving it undefined keeps it a plain command.
   */
  active?: boolean;
  /** Right-aligned secondary text (counts, shortcuts). */
  hint?: string;
  onSelect: () => void;
}

const NAV_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"] as const;

export type MenuNavKey = (typeof NAV_KEYS)[number];

/** Narrows a raw `KeyboardEvent.key` to the keys the menu itself handles. */
export function isMenuNavKey(key: string): key is MenuNavKey {
  return (NAV_KEYS as readonly string[]).includes(key);
}

/**
 * Index that receives focus after a navigation key, wrapping at both ends.
 * `-1` means "nothing focused yet": ↓ starts at the top, ↑ at the bottom.
 */
export function nextMenuIndex(current: number, count: number, key: MenuNavKey): number {
  if (count === 0) {
    return -1;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }

  const step = key === "ArrowDown" ? 1 : -1;
  const start = current < 0 ? (step === 1 ? -1 : 0) : current;
  return (start + step + count) % count;
}

export interface MenuPanelProps {
  /** Accessible name of the popup. */
  label: string;
  items: MenuItem[];
  /** Item that owns keyboard focus (`-1` before the first navigation). */
  focusedIndex: number;
  /** Receives every activation, from mouse or keyboard. */
  onSelect: (item: MenuItem) => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  panelRef?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
}

/** Popup list itself: pure markup, so it can be asserted without a DOM. */
export function MenuPanel({
  label,
  items,
  focusedIndex,
  onSelect,
  onKeyDown,
  panelRef,
  className,
  style,
}: MenuPanelProps) {
  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label={label}
      style={style}
      onKeyDown={onKeyDown}
      className={cn(
        "fixed z-50 min-w-[176px] rounded-[2px] border border-border bg-panel2 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      {items.map((item, index) => (
        <MenuItemButton
          key={item.id}
          item={item}
          index={index}
          focused={index === focusedIndex}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

interface MenuItemButtonProps {
  item: MenuItem;
  index: number;
  focused: boolean;
  onSelect: (item: MenuItem) => void;
}

/**
 * One row of the popup. The role is decided per item and written statically:
 * selectable options are `menuitemradio` (with `aria-checked`), plain commands
 * stay `menuitem`.
 */
function MenuItemButton({ item, index, focused, onSelect }: MenuItemButtonProps) {
  const shared = {
    type: "button",
    "data-index": index,
    tabIndex: focused ? 0 : -1,
    onClick: () => onSelect(item),
    className: cn(
      "flex h-6 w-full cursor-pointer items-center gap-2 px-2 text-left text-[10px] font-semibold tracking-[0.04em] uppercase outline-none",
      item.active
        ? "bg-panel3 text-ink-bright"
        : "text-ink-dim hover:bg-panel3 hover:text-ink-bright focus:bg-panel3 focus:text-ink-bright",
    ),
  } as const;

  const content = (
    <>
      <span className="flex w-3 shrink-0 items-center justify-center">
        {item.icon ? (
          <Icon name={item.icon} size={10} />
        ) : (
          <span aria-hidden="true" className="text-[7px] text-orange">
            {item.active ? "●" : ""}
          </span>
        )}
      </span>
      <span className="truncate">{item.label}</span>
      {item.hint ? (
        <span className="ml-auto shrink-0 font-mono text-[9px] text-ink-dim">{item.hint}</span>
      ) : null}
    </>
  );

  if (item.active === undefined) {
    return (
      <button role="menuitem" {...shared}>
        {content}
      </button>
    );
  }

  return (
    <button role="menuitemradio" aria-checked={item.active} {...shared}>
      {content}
    </button>
  );
}

export type MenuTriggerVariant =
  /** 12px chevron for the corner of a ribbon icon box. */
  | "chevron"
  /** 22px pill that shows the current value (ribbon period selector). */
  | "pill";

export interface MenuProps {
  /** Accessible name shared by the trigger and the popup. */
  label: string;
  items: MenuItem[];
  variant: MenuTriggerVariant;
  /** Pill text; defaults to the label of the active item (or the first). */
  text?: string;
  className?: string;
}

/** Width the popup assumes when clamping it to the viewport. */
const PANEL_WIDTH = 176;

/**
 * Menu button for the ribbon: the trigger opens a popup anchored to it. The popup
 * is portaled to `document.body` because the ribbon lives in a horizontally
 * scrolling row and an in-flow panel would be clipped by it.
 */
export function Menu({ label, items, variant, text, className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeIndex = items.findIndex((item) => item.active);
  const triggerText = text ?? items[Math.max(activeIndex, 0)]?.label ?? "";

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setFocusedIndex(-1);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const openMenu = (focus: number) => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 2,
      left: Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_WIDTH - 8),
    });
    setFocusedIndex(focus);
    setOpen(true);
  };

  const select = (item: MenuItem) => {
    close(true);
    item.onSelect();
  };

  // Closing the popup when the anchor moves keeps it from floating away.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      close(false);
    };
    const onMove = () => close(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`)?.focus();
  }, [open, focusedIndex]);

  const onPanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close(false);
      return;
    }
    if (isMenuNavKey(event.key)) {
      const key = event.key;
      event.preventDefault();
      setFocusedIndex((current) => nextMenuIndex(current, items.length, key));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const item = items[focusedIndex];
      if (item) {
        select(item);
      }
    }
  };

  const onTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }
    event.preventDefault();
    openMenu(event.key === "ArrowUp" ? items.length - 1 : Math.max(activeIndex, 0));
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label} options`}
        onClick={() => (open ? close(false) : openMenu(Math.max(activeIndex, 0)))}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex shrink-0 cursor-pointer items-center rounded-[2px] font-mono transition-colors",
          variant === "chevron"
            ? "size-3 justify-center border border-border bg-panel text-[7px] text-ink-dim hover:border-orange hover:text-orange"
            : "h-[22px] justify-between gap-1.5 border border-border bg-panel2 px-1.5 text-[10px] text-ink hover:border-border-l",
          open && "border-orange text-orange",
          className,
        )}
      >
        {variant === "pill" ? (
          <>
            <span>{triggerText}</span>
            <span aria-hidden="true" className="text-[9px]">
              ▾
            </span>
          </>
        ) : (
          <span aria-hidden="true">▾</span>
        )}
      </button>
      {open && position
        ? createPortal(
            <MenuPanel
              label={label}
              items={items}
              focusedIndex={focusedIndex}
              onSelect={select}
              onKeyDown={onPanelKeyDown}
              panelRef={panelRef}
              style={{ top: position.top, left: position.left, width: PANEL_WIDTH }}
            />,
            document.body,
          )
        : null}
    </>
  );
}
