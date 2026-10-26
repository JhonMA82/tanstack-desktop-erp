import { afterEach, describe, expect, test } from "bun:test";
import { z } from "zod";
import { ApiError, getJson } from "./api";

const payloadSchema: z.ZodType<{ id: string }> = z.object({ id: z.string() });

const originalFetch = globalThis.fetch;

/** Replaces `fetch` for one test and records the requested URLs. */
function stubFetch(handler: (url: string) => Promise<Response>): string[] {
  const calls: string[] = [];
  globalThis.fetch = ((input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return handler(url);
  }) as typeof fetch;
  return calls;
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

/** Awaits `promise` and returns the thrown `ApiError` for assertions. */
async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (thrown) {
    expect(thrown).toBeInstanceOf(ApiError);
    return thrown as ApiError;
  }
  throw new Error("Expected the request to fail");
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("getJson", () => {
  test("prefixes the base URL and returns the validated payload", async () => {
    const calls = stubFetch(async () => jsonResponse({ id: "INV-1", ignored: true }));

    await expect(getJson("/records/1", payloadSchema)).resolves.toEqual({ id: "INV-1" });
    expect(calls).toEqual(["/api/records/1"]);
  });

  test("throws ApiError carrying the HTTP status when the response is not ok", async () => {
    stubFetch(async () =>
      jsonResponse({ message: "nope" }, { status: 404, statusText: "Not Found" }),
    );

    const error = await failure(getJson("/missing", payloadSchema));

    expect(error.status).toBe(404);
    expect(error.message).toContain("404");
  });

  test("throws ApiError 502 when the payload breaks the contract", async () => {
    stubFetch(async () => jsonResponse({ id: 42 }));

    const error = await failure(getJson("/records/1", payloadSchema));

    expect(error.status).toBe(502);
    expect(error.message).toContain("id");
  });

  test("throws ApiError 0 when the transport fails", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));

    const error = await failure(getJson("/dashboard", payloadSchema));

    expect(error.status).toBe(0);
    expect(error.message).toContain("offline");
  });

  test("throws ApiError when the body is not JSON", async () => {
    stubFetch(async () => new Response("<html>", { status: 200 }));

    const error = await failure(getJson("/dashboard", payloadSchema));

    expect(error.message).toContain("not valid JSON");
  });
});
