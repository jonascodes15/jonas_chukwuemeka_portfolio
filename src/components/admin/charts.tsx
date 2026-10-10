"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Charts for the dashboard. Colours come from the theme tokens through CSS
 * (see the .chart-* rules in globals.css), so they follow light and dark mode.
 */

export interface ChartPoint {
  day: string;
  views: number;
  visitors: number;
  clicks: number;
}

const shortDay = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; dataKey?: string | number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-fg">{label ? shortDay(label) : ""}</p>
      {payload.map((p) => (
        <p key={String(p.dataKey)} className="flex justify-between gap-6 text-muted">
          <span>{p.name}</span>
          <span className="font-mono text-fg tabular-nums">{p.value?.toLocaleString("en-US")}</span>
        </p>
      ))}
    </div>
  );
}

const axis = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11 },
  className: "chart-axis",
} as const;

export function TrafficChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="chart h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} className="chart-grid" />
          <XAxis dataKey="day" tickFormatter={shortDay} minTickGap={24} {...axis} />
          <YAxis allowDecimals={false} width={44} {...axis} />
          <Tooltip content={<ChartTooltip />} cursor={{ className: "chart-cursor" }} />
          <Area
            type="monotone"
            dataKey="views"
            name="Page views"
            className="chart-views"
            strokeWidth={2}
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            className="chart-visitors"
            strokeWidth={2}
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClicksChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="chart h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid vertical={false} className="chart-grid" />
          <XAxis dataKey="day" tickFormatter={shortDay} minTickGap={24} {...axis} />
          <YAxis allowDecimals={false} width={44} {...axis} />
          <Tooltip content={<ChartTooltip />} cursor={{ className: "chart-cursor" }} />
          <Bar
            dataKey="clicks"
            name="Clicks"
            className="chart-clicks"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
