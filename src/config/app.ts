/**
 * Brand and company identity of the app. The shell (top bar, inspector, command
 * palette, document title) reads from here, so rebranding a project built on this
 * base never means editing layout components.
 */
export interface AppConfig {
  /** Product name in the top bar brand. */
  name: string;
  /** Display version shown next to the name (`v<version>`). */
  version: string;
  /** Glyph rendered before the brand name. */
  mark: string;
  /** Fake document path shown next to the brand (desktop-app flavour). */
  filePath: string;
  /** Short organization marker for the top bar chip. */
  organization: string;
  /** Avatar initials in the top bar. */
  initials: string;
  /** Footer tagline of the command palette. */
  tagline: string;
}

export const APP = {
  name: "APP CORE",
  version: "1.0",
  mark: "●",
  filePath: "/workspace/main — PROJECT: WORKSPACE.app",
  organization: "WORKSPACE",
  initials: "WS",
  tagline: "APP CORE v1 — DESKTOP EDITION",
} satisfies AppConfig;

/** Company identity shown in the inspector and used by the mock data. */
export interface CompanyConfig {
  name: string;
  /** Reporting year label, e.g. `2024-2025`. */
  fiscalYear: string;
  /** Base currency code, e.g. `USD`. */
  currency: string;
}

export const COMPANY = {
  name: "ACME CORP",
  fiscalYear: "2024-2025",
  currency: "USD",
} satisfies CompanyConfig;
