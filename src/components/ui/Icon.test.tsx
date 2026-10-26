import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { IconName } from "@/lib/icons";
import { ICONS } from "@/lib/icons";
import { Icon } from "./Icon";

/**
 * The renderer is the only place that pins the shell's stroke, so these are the
 * guards for the visual decision: size, weight and caps live here, not in every
 * call site. There is no DOM in `bun test`; SSR markup is enough.
 */
describe("Icon", () => {
  test("renders at the requested size with the shell's stroke", () => {
    const html = renderToStaticMarkup(<Icon name="plus" size={14} />);

    expect(html).toContain('width="14"');
    expect(html).toContain('height="14"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('stroke-width="2"');
    expect(html).toContain('stroke-linecap="square"');
    expect(html).toContain('stroke-linejoin="miter"');
  });

  test("defaults to 12px and stays decorative", () => {
    const html = renderToStaticMarkup(<Icon name="search" />);

    expect(html).toContain('width="12"');
    expect(html).toContain('aria-hidden="true"');
  });

  test("renders every icon of the curated catalog", () => {
    const names = Object.keys(ICONS) as IconName[];
    expect(names.length).toBeGreaterThan(20);

    for (const name of names) {
      const html = renderToStaticMarkup(<Icon name={name} />);
      // A name mapped to a missing component would render nothing at all.
      expect(html.startsWith("<svg")).toBe(true);
      expect(/<(path|circle|rect|line|polyline|polygon|ellipse)/.test(html)).toBe(true);
    }
  });
});
