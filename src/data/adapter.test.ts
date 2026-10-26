import { describe, expect, test } from "bun:test";
import { DATA_SOURCE } from "@/lib/env";
import { fetchOverview } from "./overview";

/**
 * The mock adapter parses its own fixture with the wire schema, so a fixture that
 * drifts from the contract fails here instead of reaching a component.
 */
describe("mock data adapter", () => {
  test("runs on the mock origin by default", () => {
    expect(DATA_SOURCE).toBe("mock");
  });

  test("resolves the fixture through its wire contract", async () => {
    const overview = await fetchOverview();

    expect(overview.metrics.length).toBeGreaterThan(0);
    expect(overview.activity.length).toBeGreaterThan(0);
    expect(overview.totalLabel).toMatch(/RECORDS$/);
  });
});
