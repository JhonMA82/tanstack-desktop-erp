import { queryOptions } from "@tanstack/react-query";
import type { LedgerStatus } from "@/lib/ledger";

export interface MetricDatum {
  label: string;
  value: string;
  delta: string;
  accent: string;
  spark: number[];
}

export interface RevenueSeries {
  /** Main orange trend polyline (SVG points, 500×140 viewBox). */
  trend: string;
  /** Dashed comparison polyline. */
  baseline: string;
  min: string;
  max: string;
  average: string;
  yoy: string;
}

export interface HistogramBar {
  /** Account code shown under the bar (e.g. `6000`). */
  account: string;
  /** Bar height in the 140px SVG space. */
  height: number;
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  vendor: string;
  description: string;
  account: string;
  debit: string;
  credit: string;
  status: LedgerStatus;
}

export interface DashboardData {
  /** Reporting period used in metric footers and panel headers (e.g. `30D`). */
  period: string;
  /** Base currency code shown in metric footers. */
  currency: string;
  metrics: MetricDatum[];
  revenue: RevenueSeries;
  histogram: {
    bars: HistogramBar[];
    /** Allocation breakdown line under the histogram. */
    breakdown: string;
  };
  transactions: Transaction[];
  /** Header total of the recent-transactions table. */
  total: string;
}

const DASHBOARD_DATA: DashboardData = {
  period: "30D",
  currency: "USD",
  metrics: [
    {
      label: "CASH",
      value: "$128,400",
      delta: "+8.2%",
      accent: "var(--green)",
      spark: [12, 14, 11, 16, 18, 15, 20, 19, 22],
    },
    {
      label: "RECEIVABLES",
      value: "$42,128",
      delta: "+12.4%",
      accent: "var(--orange)",
      spark: [8, 10, 14, 12, 16, 18, 15, 19, 21],
    },
    {
      label: "PAYABLES",
      value: "$18,420",
      delta: "-3.1%",
      accent: "var(--red)",
      spark: [20, 18, 16, 14, 12, 10, 9, 8, 6],
    },
    {
      label: "PAYROLL",
      value: "$24,128",
      delta: "RUN OCT",
      accent: "var(--blue)",
      spark: [12, 12, 12, 24, 12, 12, 12, 24, 12],
    },
  ],
  revenue: {
    trend: "40,100 80,88 120,94 160,72 200,68 240,60 280,52 320,58 360,42 400,44 440,36 480,30",
    baseline:
      "40,110 80,104 120,108 160,96 200,92 240,88 280,82 320,88 360,76 400,78 440,70 480,68",
    min: "$28K",
    max: "$48K",
    average: "$39.4K",
    yoy: "+12% YoY",
  },
  histogram: {
    bars: [
      { account: "6000", height: 40, color: "var(--blue)" },
      { account: "6100", height: 22, color: "#3a3a3a" },
      { account: "7000", height: 68, color: "var(--orange)" },
      { account: "6200", height: 30, color: "#3a3a3a" },
      { account: "6300", height: 18, color: "#3a3a3a" },
      { account: "6400", height: 12, color: "#3a3a3a" },
    ],
    breakdown: "PAYROLL 62% • SOFTWARE 18% • HOSTING 12%",
  },
  transactions: [
    {
      id: "INV-2024-1248",
      date: "2024-11-02",
      vendor: "ACME CORP / CLIENT A",
      description: "Q4 Consulting Services — Retainer",
      account: "4000 Sales",
      debit: "",
      credit: "$12,400.00",
      status: "POSTED",
    },
    {
      id: "BILL-2024-089",
      date: "2024-11-01",
      vendor: "AWS EMEA",
      description: "Cloud Infrastructure OCT",
      account: "6000 Hosting",
      debit: "$2,841.22",
      credit: "",
      status: "POSTED",
    },
    {
      id: "EXP-2024-156",
      date: "2024-10-30",
      vendor: "J. SMITH",
      description: "Travel Reimb — SF Conference",
      account: "6200 Travel",
      debit: "$1,240.00",
      credit: "",
      status: "DRAFT",
    },
    {
      id: "INV-2024-1247",
      date: "2024-10-29",
      vendor: "LINEAR DESIGN LLC",
      description: "License Annual Team 12 seats",
      account: "4000 Sales",
      debit: "",
      credit: "$3,588.00",
      status: "POSTED",
    },
    {
      id: "BILL-2024-088",
      date: "2024-10-28",
      vendor: "FIGMA INC",
      description: "Organization Plan",
      account: "6100 Software",
      debit: "$540.00",
      credit: "",
      status: "PENDING",
    },
    {
      id: "CN-2024-012",
      date: "2024-10-27",
      vendor: "ACME CORP",
      description: "Credit Note — Overbilling Adj",
      account: "4000 Sales",
      debit: "$400.00",
      credit: "",
      status: "POSTED",
    },
    {
      id: "EXP-2024-155",
      date: "2024-10-26",
      vendor: "U. BERLIN OFFICE",
      description: "Coworking Q4",
      account: "6300 Rent",
      debit: "$2,200.00",
      credit: "",
      status: "POSTED",
    },
    {
      id: "INV-2024-1246",
      date: "2024-10-25",
      vendor: "VERCEL INC",
      description: "Enterprise Add-on + Usage",
      account: "4000 Sales",
      debit: "",
      credit: "$8,900.00",
      status: "DRAFT",
    },
    {
      id: "BILL-2024-087",
      date: "2024-10-24",
      vendor: "STRIPE",
      description: "Processing Fees OCT",
      account: "6400 Fees",
      debit: "$412.33",
      credit: "",
      status: "POSTED",
    },
  ],
  total: "$42,128.00",
};

/**
 * Simulated API latency so loading states are observable during development.
 * Replace the body with a real `fetch` when wiring a backend; the returned
 * `dashboardQueryOptions` contract stays the same.
 */
const SIMULATED_LATENCY_MS = 250;

export async function fetchDashboard(): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  return DASHBOARD_DATA;
}

/** TanStack Query options for the dashboard payload (key: `["dashboard"]`). */
export const dashboardQueryOptions = queryOptions({
  queryKey: ["dashboard"],
  queryFn: fetchDashboard,
});
