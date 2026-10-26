import type { z } from "zod";
import { API_BASE_URL } from "./env";

/** Upper bound for a single API request, so a hung backend surfaces as an error. */
const REQUEST_TIMEOUT_MS = 15_000;

/** Latency the mock adapter waits for, so loading states stay observable in dev. */
export const MOCK_LATENCY_MS = 250;

/** Data-layer failure: transport, HTTP status, or a payload that breaks the contract. */
export class ApiError extends Error {
  /** HTTP status, or `0` when the request never reached the server. */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Message for any thrown value, shared by route error panels and tests. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

/** Resolves after `ms`: the mock adapter's stand-in for network latency. */
export function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * GETs `path` from the API, validates the payload with `schema` and returns it.
 * Every failure mode throws `ApiError`, so callers handle a single error type.
 */
export async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await request(url);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(`Response from ${url} is not valid JSON`, response.status);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const detail = issue
      ? `${issue.path.join(".") || "(root)"}: ${issue.message}`
      : "contract mismatch";
    throw new ApiError(`Invalid payload from ${url} — ${detail}`, 502);
  }

  return parsed.data;
}

/** Performs the request and normalizes transport and status failures into `ApiError`. */
async function request(url: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new ApiError(`Request to ${url} failed — ${reason}`, 0);
  }

  if (!response.ok) {
    throw new ApiError(`${response.status} ${response.statusText} — ${url}`, response.status);
  }

  return response;
}
