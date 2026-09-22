import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { ToastProvider } from "@/components/feedback/toaster";
import { fetchInvoice } from "@/data/invoice";
import { InvoiceComposer } from "./InvoiceComposer";

/**
 * Runtime smoke for the `/invoice` example: renders the whole composer (intro
 * bar, form sections and the scaled paper preview) through React's real render
 * pipeline, so a broken hook, missing provider or bad import fails here even
 * when typecheck is green.
 */
describe("InvoiceComposer", () => {
  test("renders the form and the printable paper with live totals", async () => {
    const seed = await fetchInvoice();
    const html = renderToString(
      <ToastProvider>
        <InvoiceComposer seed={seed} />
      </ToastProvider>,
    );

    // Intro bar and document actions.
    expect(html).toContain("Create New Invoice");
    expect(html).toContain("Save as Draft");
    expect(html).toContain("Send Invoice");

    // Form sections.
    expect(html).toContain("Invoice Details");
    expect(html).toContain("Billed To");
    expect(html).toContain("AIY Cap");
    expect(html).toContain("Invoice Items");
    expect(html).toContain("Cloud hosting services");
    expect(html).toContain("Adjustments");

    // Paper: seed totals = 5400 subtotal − 40 discount + 12% VAT = 6003.20.
    // SSR interleaves `<!-- -->` between text nodes, so normalize before matching.
    const text = html.replaceAll("<!-- -->", "");
    expect(text).toContain("Balance Due");
    expect(text).toContain("$6,003.20");
    expect(text).toContain("VAT 12%");
    expect(text).toContain("Weblabs Studio");
  });

  test("adds no line for an empty draft without breaking the paper", async () => {
    const seed = await fetchInvoice();
    const html = renderToString(
      <ToastProvider>
        <InvoiceComposer seed={{ ...seed, defaults: { ...seed.defaults, items: [] } }} />
      </ToastProvider>,
    );

    expect(html).toContain("NO LINES");
    expect(html).toContain("$0.00");
  });
});
