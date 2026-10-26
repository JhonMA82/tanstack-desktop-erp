import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { isMenuNavKey, Menu, type MenuItem, MenuPanel, nextMenuIndex } from "./Menu";

function item(id: string, label: string, extra: Partial<MenuItem> = {}): MenuItem {
  return { id, label, onSelect: () => {}, ...extra };
}

/**
 * `bun test` has no DOM, so what is asserted here is the pure navigation math and
 * the markup of the popup/trigger. Opening with the mouse, portal placement and
 * focus return are browser behaviour, not covered by this suite.
 */
describe("nextMenuIndex", () => {
  test("starts at the first item with ↓ and at the last one with ↑", () => {
    expect(nextMenuIndex(-1, 4, "ArrowDown")).toBe(0);
    expect(nextMenuIndex(-1, 4, "ArrowUp")).toBe(3);
  });

  test("wraps at both ends", () => {
    expect(nextMenuIndex(3, 4, "ArrowDown")).toBe(0);
    expect(nextMenuIndex(0, 4, "ArrowUp")).toBe(3);
  });

  test("jumps to the first and last item", () => {
    expect(nextMenuIndex(2, 4, "Home")).toBe(0);
    expect(nextMenuIndex(1, 4, "End")).toBe(3);
  });

  test("returns -1 for an empty menu", () => {
    expect(nextMenuIndex(-1, 0, "ArrowDown")).toBe(-1);
  });
});

describe("isMenuNavKey", () => {
  test("accepts only the keys the menu handles", () => {
    expect(isMenuNavKey("ArrowDown")).toBe(true);
    expect(isMenuNavKey("End")).toBe(true);
    expect(isMenuNavKey("Enter")).toBe(false);
    expect(isMenuNavKey("Tab")).toBe(false);
  });
});

describe("MenuPanel", () => {
  test("exposes options as radios with their checked state", () => {
    const html = renderToString(
      <MenuPanel
        label="Period"
        focusedIndex={0}
        onSelect={() => {}}
        items={[item("p7", "7D", { active: false }), item("p30", "30D", { active: true })]}
      />,
    );

    expect(html).toContain('role="menu"');
    expect(html).toContain('aria-label="Period"');
    expect(html).toContain('role="menuitemradio"');
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain('aria-checked="false"');
    // The current choice is marked with an icon, never with a text glyph.
    expect(html.match(/<svg/g)).toHaveLength(1);
    expect(html).not.toContain("●");
  });

  test("keeps plain commands as menu items and renders their hint", () => {
    const html = renderToString(
      <MenuPanel
        label="New Record"
        focusedIndex={-1}
        onSelect={() => {}}
        items={[item("bill", "New Bill", { hint: "4" })]}
      />,
    );

    expect(html).toContain('role="menuitem"');
    expect(html).not.toContain("menuitemradio");
    expect(html).not.toContain("aria-checked");
    expect(html).toContain(">4<");
  });

  test("renders the icon of a row that declares one", () => {
    const html = renderToString(
      <MenuPanel
        label="New Record"
        focusedIndex={-1}
        onSelect={() => {}}
        items={[item("note", "New Note", { icon: "file" }), item("plain", "Plain")]}
      />,
    );

    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
  });

  test("only the focused row is tabbable", () => {
    const html = renderToString(
      <MenuPanel
        label="View"
        focusedIndex={1}
        onSelect={() => {}}
        items={[item("grid", "Grid"), item("list", "List")]}
      />,
    );

    const rows = html.match(/tabindex="[^"]*"/g) ?? [];
    expect(rows).toEqual(['tabindex="-1"', 'tabindex="0"']);
  });
});

describe("Menu", () => {
  test("draws the chevron trigger with an icon, not a text glyph", () => {
    const html = renderToString(
      <Menu label="New Client" variant="chevron" items={[item("a", "A")]} />,
    );

    // A 7px text glyph depends on the system font and can read as an empty slot.
    expect(html).toContain("<svg");
    expect(html).not.toContain("▾");
  });

  test("renders a closed trigger that advertises the popup and the current value", () => {
    const html = renderToString(
      <Menu
        label="Period"
        variant="pill"
        items={[item("p7", "7D"), item("p30", "30D", { active: true })]}
      />,
    );

    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Period options"');
    expect(html).toContain("30D");
    // The popup itself only exists once opened on the client.
    expect(html).not.toContain('role="menu"');
  });
});
