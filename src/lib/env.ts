import { z } from "zod";

/**
 * Data origins understood by the data layer: `mock` serves the fixtures in
 * `src/data` behind simulated latency; `http` calls the API at
 * `VITE_API_BASE_URL`. See `.env.example`.
 */
export const DATA_SOURCES = ["mock", "http"] as const;

export type DataSource = (typeof DATA_SOURCES)[number];

declare global {
  interface ImportMetaEnv {
    /** `mock` (default) or `http`. */
    readonly VITE_DATA_SOURCE?: string;
    /** API prefix used when `VITE_DATA_SOURCE=http` (default `/api`). */
    readonly VITE_API_BASE_URL?: string;
  }
}

const sourceSchema = z.enum(DATA_SOURCES);

const parsedSource = sourceSchema.safeParse(import.meta.env.VITE_DATA_SOURCE ?? "mock");

if (!parsedSource.success) {
  throw new Error(
    `Invalid VITE_DATA_SOURCE="${import.meta.env.VITE_DATA_SOURCE}". Expected "mock" or "http".`,
  );
}

/** Active data origin, resolved once at startup. */
export const DATA_SOURCE: DataSource = parsedSource.data;

/** Base URL prefixed to every HTTP request (unused while `DATA_SOURCE` is `mock`). */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api";
