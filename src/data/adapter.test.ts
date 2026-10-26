import { describe, expect, test } from "bun:test";
import { DATA_SOURCE } from "@/lib/env";
import { fetchDashboard } from "./dashboard";
import { fetchInvoice } from "./invoice";

/**
 * The mock adapter parses its own fixtures with the wire schema, so a fixture
 * that drifts from the contract fails here instead of reaching a component.
 */
describe("mock data adapter", () => {
  test("runs on the mock origin by default", () => {
    expect(DATA_SOURCE).toBe("mock");
  });

  test("resolves both fixtures through their wire contracts", async () => {
    const dashboard = await fetchDashboard();
    expect(dashboard.period).toBe("30D");
    expect(dashboard.metrics).toHaveLength(4);
    expect(dashboard.transactions.length).toBeGreaterThan(0);

    const invoice = await fetchInvoice();
    expect(invoice.taxOptions.length).toBeGreaterThan(0);
    expect(invoice.defaults.items.length).toBeGreaterThan(0);
  });
});
