import type { Metadata } from "next";
import { Suspense } from "react";
import { ClicksChart, TrafficChart } from "@/components/admin/charts";
import {
  BarList,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatCard,
} from "@/components/admin/ui";
import { topBy, trafficSeries, trafficTotals } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const countryName = (code: string) => {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

export default function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ range }) => (
        <Analytics days={RANGES.find((r) => String(r) === range) ?? 30} />
      ))}
    </Suspense>
  );
}

async function Analytics({ days }: { days: number }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Analytics"
      description="First-party and privacy-friendly: no cookies on visitors, no raw IPs, bots and your own visits left out."
    />
  );
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }

  const [series, totals, pages, referrers, clicks, countries, devices, browsers, systems] = await Promise.all(
    [
      trafficSeries(db, days),
      trafficTotals(db, days),
      topBy(db, "path", "pageview", days, 10),
      topBy(db, "referrer", "pageview", days, 10),
      topBy(db, "label", "click", days, 12),
      topBy(db, "country", "pageview", days, 10),
      topBy(db, "device", "pageview", days),
      topBy(db, "browser", "pageview", days),
      topBy(db, "os", "pageview", days),
    ],
  );
  const { current, previous } = totals;
  const perVisitor = current.visitors ? Math.round((current.views / current.visitors) * 10) / 10 : 0;

  return (
    <>
      {header}
      <FilterTabs
        active={String(days)}
        items={RANGES.map((r) => ({
          label: `Last ${r} days`,
          value: String(r),
          href: `/admin/analytics?range=${r}`,
        }))}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors" value={current.visitors} previous={previous.visitors} />
        <StatCard label="Page views" value={current.views} previous={previous.views} />
        <StatCard label="Clicks" value={current.clicks} previous={previous.clicks} />
        <StatCard label="Pages per visitor" value={perVisitor} hint="Average" />
      </div>

      <Panel title="Page views and visitors" className="mt-4">
        <TrafficChart data={series} />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Pages">
          <BarList rows={pages} />
        </Panel>
        <Panel title="Referrers">
          <BarList rows={referrers} empty="No external referrers yet." />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Panel title="Clicks per day">
          <ClicksChart data={series} />
        </Panel>
        <Panel title="What people click">
          <BarList
            rows={clicks}
            empty="No clicks recorded yet."
            format={(k) => <span className="font-mono text-xs">{k}</span>}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Countries">
          <BarList rows={countries} format={countryName} />
        </Panel>
        <Panel title="Devices">
          <BarList rows={devices} format={(k) => <span className="capitalize">{k}</span>} />
        </Panel>
        <Panel title="Browsers">
          <BarList rows={browsers} />
        </Panel>
        <Panel title="Operating systems">
          <BarList rows={systems} />
        </Panel>
      </div>
    </>
  );
}
