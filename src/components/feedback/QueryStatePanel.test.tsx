import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Button } from "@/components/ui/Button";
import { QueryStatePanel } from "./QueryStatePanel";

/**
 * `QueryStatePanel` is the only loading/error body in the app: routes, route
 * boundaries and future modules share it, so its states are asserted here once.
 */
describe("QueryStatePanel", () => {
  test("announces a pending state politely and keeps the message dim", () => {
    const html = renderToString(
      <QueryStatePanel title="MODULE" state="pending" message="LOADING…" />,
    );

    expect(html).toContain('role="status"');
    expect(html).toContain("LOADING…");
    expect(html).not.toContain("text-red");
  });

  test("announces an error loudly and paints the message red", () => {
    const html = renderToString(
      <QueryStatePanel title="MODULE • ERROR" state="error" message="Request failed" />,
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("text-red");
    expect(html).toContain("Request failed");
  });

  test("renders the actions it is given", () => {
    const html = renderToString(
      <QueryStatePanel
        title="MODULE • ERROR"
        state="error"
        message="boom"
        actions={<Button>RETRY</Button>}
      />,
    );

    expect(html).toContain("RETRY");
  });
});
