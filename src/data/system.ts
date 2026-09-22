/** Static company identity shown in the properties inspector. */
export interface CompanyInfo {
  name: string;
  fiscalYear: string;
  currency: string;
}

export const COMPANY: CompanyInfo = {
  name: "ACME CORP",
  fiscalYear: "2024-2025",
  currency: "USD",
};

/** Mock system performance snapshot for the inspector meters. */
export interface SystemPerformance {
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  vramUsedGb: number;
  vramTotalGb: number;
  fps: number;
}

export const SYSTEM_PERFORMANCE: SystemPerformance = {
  cpuPercent: 34,
  ramUsedGb: 2.1,
  ramTotalGb: 8,
  vramUsedGb: 4.2,
  vramTotalGb: 24,
  fps: 60,
};
