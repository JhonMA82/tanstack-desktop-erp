import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { getJson, simulateLatency } from "@/lib/api";
import { DATA_SOURCE } from "@/lib/env";

/** Semantic accent of a KPI: the widget maps it to a design token, not the data. */
export type MetricTone = "positive" | "warning" | "neutral";

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  /** Short delta chip (e.g. `+4.1%`, `−2`). */
  delta: string;
  tone: MetricTone;
  /** Sparkline samples: higher reads as a higher point. */
  spark: number[];
}

export type ActivityStatus = "ACTIVE" | "PENDING" | "ARCHIVED";

export interface ActivityRow {
  id: string;
  /** ISO date (`YYYY-MM-DD`). */
  at: string;
  subject: string;
  category: string;
  status: ActivityStatus;
}

export interface OverviewData {
  metrics: OverviewMetric[];
  activity: ActivityRow[];
  /** Header counter of the activity table (e.g. `5 RECORDS`). */
  totalLabel: string;
}

const metricSchema: z.ZodType<OverviewMetric> = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  delta: z.string(),
  tone: z.enum(["positive", "warning", "neutral"]),
  spark: z.array(z.number()),
});

const activitySchema: z.ZodType<ActivityRow> = z.object({
  id: z.string(),
  at: z.string(),
  subject: z.string(),
  category: z.string(),
  status: z.enum(["ACTIVE", "PENDING", "ARCHIVED"]),
});

/** Wire contract of `/overview`; the mock fixture is validated with it too. */
const overviewSchema: z.ZodType<OverviewData> = z.object({
  metrics: z.array(metricSchema),
  activity: z.array(activitySchema),
  totalLabel: z.string(),
});

/**
 * Placeholder payload of the base template. Replace it with your domain data —
 * the shape, the schema and the fetcher are what the rest of the app relies on.
 */
const OVERVIEW_FIXTURE: OverviewData = {
  metrics: [
    {
      id: "active-records",
      label: "ACTIVE RECORDS",
      value: "1,284",
      delta: "+4.1%",
      tone: "positive",
      spark: [8, 9, 7, 11, 12, 10, 13, 15, 14, 16],
    },
    {
      id: "open-items",
      label: "OPEN ITEMS",
      value: "37",
      delta: "−2",
      tone: "warning",
      spark: [16, 15, 15, 13, 14, 12, 12, 11, 10, 9],
    },
  ],
  activity: [
    {
      id: "ACT-1042",
      at: "2024-11-12",
      subject: "Onboarding checklist",
      category: "PEOPLE",
      status: "ACTIVE",
    },
    {
      id: "ACT-1041",
      at: "2024-11-11",
      subject: "Access review",
      category: "SECURITY",
      status: "PENDING",
    },
    {
      id: "ACT-1040",
      at: "2024-11-09",
      subject: "Q4 planning notes",
      category: "PLANNING",
      status: "ACTIVE",
    },
    {
      id: "ACT-1039",
      at: "2024-11-07",
      subject: "Research notes",
      category: "OPERATIONS",
      status: "ARCHIVED",
    },
    {
      id: "ACT-1038",
      at: "2024-11-05",
      subject: "Support playbook",
      category: "OPERATIONS",
      status: "ACTIVE",
    },
  ],
  totalLabel: "5 RECORDS",
};

/**
 * Loads the overview payload from the configured data origin: the mock fixture
 * behind simulated latency, or `GET /overview` validated against the contract.
 * One env variable (`VITE_DATA_SOURCE`) switches between them.
 */
export async function fetchOverview(): Promise<OverviewData> {
  if (DATA_SOURCE === "http") {
    return getJson("/overview", overviewSchema);
  }

  await simulateLatency();
  return overviewSchema.parse(OVERVIEW_FIXTURE);
}

/** TanStack Query options for the overview payload (key: `["overview"]`). */
export const overviewQueryOptions = queryOptions({
  queryKey: ["overview"],
  queryFn: fetchOverview,
});
