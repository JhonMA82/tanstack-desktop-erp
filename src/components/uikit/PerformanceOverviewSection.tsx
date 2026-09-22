import { useMemo, useState } from "react";
import { useToast } from "@/components/feedback/toaster";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import type { PerformancePoint } from "@/data/admin-dashboard";
import { PERFORMANCE_SERIES } from "@/data/admin-dashboard";
import { cn } from "@/lib/cn";

interface PeriodDef {
  value: string;
  label: string;
  points: number;
  days: number;
}

const PERIODS: PeriodDef[] = [
  { value: "3m", label: "3 months", points: 24, days: 90 },
  { value: "6m", label: "6 months", points: 36, days: 180 },
  { value: "12m", label: "12 months", points: 48, days: 365 },
];

const SEGMENTS = [
  { value: "all", label: "All segments", scale: 1 },
  { value: "paid", label: "Paid", scale: 0.62 },
  { value: "organic", label: "Organic", scale: 0.38 },
];

const LEGEND = [
  { label: "New Customers", className: "bg-orange" },
  { label: "Active Accounts", className: "bg-blue" },
  { label: "Returning Users", className: "bg-green" },
];

const W = 800;
const H = 300;
const PAD_T = 16;
const PAD_B = 26;
const PAD_X = 8;
const ANCHOR_DATE = new Date(Date.UTC(2026, 3, 30));

type Point2 = readonly [number, number];

function smoothPath(points: Point2[]): string {
  if (points.length === 0) return "";
  const [firstX, firstY] = points[0];
  let path = `M ${firstX},${firstY}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const midX = (x0 + x1) / 2;
    path += ` C ${midX},${y0} ${midX},${y1} ${x1},${y1}`;
  }
  return path;
}

/** Customer Activity chart: gradient area + two lines, driven by Period/Segment selects. */
export function PerformanceOverviewSection() {
  const { push } = useToast();
  const [period, setPeriod] = useState("3m");
  const [segment, setSegment] = useState("all");

  const periodDef = PERIODS.find((item) => item.value === period) ?? PERIODS[0];
  const segmentDef = SEGMENTS.find((item) => item.value === segment) ?? SEGMENTS[0];

  const points = useMemo(() => {
    const slice = PERFORMANCE_SERIES.slice(-periodDef.points);
    return slice.map(
      (point): PerformancePoint => ({
        newCustomers: Math.round(point.newCustomers * segmentDef.scale),
        activeAccounts: Math.round(point.activeAccounts * segmentDef.scale),
        returningUsers: Math.round(point.returningUsers * segmentDef.scale),
      }),
    );
  }, [periodDef, segmentDef]);

  const geometry = useMemo(() => {
    const count = points.length;
    const max = Math.max(...points.map((point) => point.newCustomers)) * 1.08;
    const x = (index: number) => PAD_X + (index / (count - 1)) * (W - PAD_X * 2);
    const y = (value: number) => PAD_T + (1 - value / max) * (H - PAD_T - PAD_B);
    const toPoints = (select: (point: PerformancePoint) => number): Point2[] =>
      points.map((point, index) => [x(index), y(select(point))] as const);

    const customers = toPoints((point) => point.newCustomers);
    const active = toPoints((point) => point.activeAccounts);
    const returning = toPoints((point) => point.returningUsers);
    const baseline = H - PAD_B;

    return {
      customersPath: smoothPath(customers),
      areaPath: `${smoothPath(customers)} L ${customers.at(-1)?.[0] ?? 0},${baseline} L ${customers[0]?.[0] ?? 0},${baseline} Z`,
      activePath: smoothPath(active),
      returningPath: smoothPath(returning),
      gridY: [0, 1, 2, 3, 4].map((step) => PAD_T + (step / 4) * (H - PAD_T - PAD_B)),
      xLabels: [
        0,
        Math.floor((count - 1) / 5),
        Math.floor(((count - 1) * 2) / 5),
        Math.floor(((count - 1) * 3) / 5),
        Math.floor(((count - 1) * 4) / 5),
        count - 1,
      ].map((index) => {
        const daysBack = Math.round(periodDef.days - (index / (count - 1)) * periodDef.days);
        const date = new Date(ANCHOR_DATE.getTime() - daysBack * 24 * 60 * 60 * 1000);
        return {
          x: x(index),
          anchor:
            index === 0
              ? ("start" as const)
              : index === count - 1
                ? ("end" as const)
                : ("middle" as const),
          label: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
        };
      }),
    };
  }, [points, periodDef]);

  return (
    <Panel
      title="Performance Overview"
      actions={
        <span className="flex items-center gap-1.5">
          <Select
            aria-label="Period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="h-5 w-24 text-[10px]"
          >
            {PERIODS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Segment"
            value={segment}
            onChange={(event) => setSegment(event.target.value)}
            className="h-5 w-28 text-[10px]"
          >
            {SEGMENTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            onClick={() =>
              push({
                kind: "INFO",
                title: "REPORT",
                message: `Customer activity — ${periodDef.label} • ${segmentDef.label}`,
              })
            }
          >
            View report
          </Button>
        </span>
      }
    >
      <div className="flex flex-col gap-1.5 p-2">
        <div className="flex flex-wrap items-center justify-end gap-3 font-mono text-[9px] text-ink-dim">
          <span className="text-[10px] text-ink">
            Customer activity for the last {periodDef.label}
          </span>
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-[1px]", item.className)} aria-hidden="true" />
              {item.label}
            </span>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img">
          <title>Customer activity area chart</title>
          <defs>
            <linearGradient id="perf-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF8C32" stopOpacity="0.36" />
              <stop offset="95%" stopColor="#FF8C32" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <g stroke="var(--border)" strokeWidth="0.75">
            {geometry.gridY.map((lineY) => (
              <line key={lineY} x1={PAD_X} y1={lineY} x2={W - PAD_X} y2={lineY} />
            ))}
          </g>
          <path d={geometry.areaPath} fill="url(#perf-fill)" stroke="none" />
          <path d={geometry.customersPath} fill="none" stroke="var(--orange)" strokeWidth="1.25" />
          <path d={geometry.activePath} fill="none" stroke="var(--blue)" strokeWidth="1.4" />
          <path d={geometry.returningPath} fill="none" stroke="var(--green)" strokeWidth="1.2" />
          <g fontSize="9" fill="var(--text-dim)" fontFamily="var(--font-mono)">
            {geometry.xLabels.map((tick) => (
              <text key={tick.x} x={tick.x} y={H - 8} textAnchor={tick.anchor}>
                {tick.label}
              </text>
            ))}
          </g>
        </svg>
      </div>
    </Panel>
  );
}
