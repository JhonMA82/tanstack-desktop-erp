import { describe, expect, test } from "bun:test";
import { formatCurrency, formatPercent } from "./format";

describe("formatCurrency", () => {
  test("formats whole USD amounts with two decimals", () => {
    expect(formatCurrency(42128)).toBe("$42,128.00");
    expect(formatCurrency(128400)).toBe("$128,400.00");
  });

  test("respects an explicit currency", () => {
    expect(formatCurrency(1000, "EUR")).toBe("€1,000.00");
  });
});

describe("formatPercent", () => {
  test("formats positive ratios with an explicit sign", () => {
    expect(formatPercent(0.124)).toBe("+12.4%");
    expect(formatPercent(0.082)).toBe("+8.2%");
  });

  test("formats negative ratios", () => {
    expect(formatPercent(-0.031)).toBe("-3.1%");
  });
});
