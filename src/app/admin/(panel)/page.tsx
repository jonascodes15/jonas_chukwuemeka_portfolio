import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { TrafficChart } from "@/components/admin/charts";
import {
  BarList,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatCard,
  StatusPill,
  timeAgo,
} from "@/components/admin/ui";
import {
  listEnquiries,
  newSince,
  onlineNow,
  statusCounts,
  topBy,
  trafficSeries,
  trafficTotals,
} from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Overview" };

const DAYS = 30;

export default function OverviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <>
        <PageHeader title="Overview" />
        <SetupNotice />
      </>
    );
  }

  const [series, totals, online, enquiryCounts, subscriberCounts, newSubs, recent, pages, clicks, referrers] =
    await Promise.all([
      trafficSeries(db, DAYS),
      trafficTotals(db, DAYS),
      onlineNow(db),
      statusCounts(db, "enquiries"),
      statusCounts(db, "subscribers"),
      newSince(db, "subscribers", DAYS),
      listEnquiries(db, "inbox", 5),
      topBy(db, "path", "pageview", DAYS, 6),
      topBy(db, "label", "click", DAYS, 6),
      topBy(db, "referrer", "pageview", DAYS, 6),
    ]);

  return (
    <>
      <PageHeader
        title="Overview"
        description={`The last ${DAYS} days.`}
        actions={
          <span className="inline-flex items-center gap-2 rounded-pill border border-border px-3 py-1.5 text-sm text-fg">
            <span aria-hidden className="size-2 animate-pulse-dot rounded-full bg-accent" />
            {online} online now
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visitors"
          value={totals.current.visitors}
          previous={totals.previous.visitors}
          href="/admin/analytics"
        />
        <StatCard
          label="Page views"
          value={totals.current.views}
          previous={totals.previous.views}
          href="/admin/analytics"
        />
        <StatCard
          label="Unread enquiries"
          value={enquiryCounts.new ?? 0}
          hint={`${(enquiryCounts.new ?? 0) + (enquiryCounts.read ?? 0) + (enquiryCounts.archived ?? 0)} in total`}
          href="/admin/enquiries"
        />
        <StatCard
          label="Subscribers"
          value={subscriberCounts.confirmed ?? 0}
          hint={`${newSubs} signed up in ${DAYS} days`}
          href="/admin/subscribers"
        />
      </div>

      <Panel
        title="Traffic"
        className="mt-4"
        action={
          <span className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-0.5 w-4 bg-accent-ink" /> Page views
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="w-4 border-t border-dashed border-muted" /> Visitors
            </span>
          </span>
        }
      >
        <TrafficChart data={series} />
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Top pages" action={<MoreLink href="/admin/analytics" />}>
          <BarList rows={pages} />
        </Panel>
        <Panel title="Top clicks" action={<MoreLink href="/admin/analytics" />}>
          <BarList rows={clicks} empty="No clicks recorded yet." />
        </Panel>
        <Panel title="Referrers" action={<MoreLink href="/admin/analytics" />}>
          <BarList rows={referrers} empty="No external referrers yet." />
        </Panel>
      </div>

      <Panel
        title="Latest enquiries"
        className="mt-4"
        action={<MoreLink href="/admin/enquiries" />}
        bodyClassName="p-0"
      >
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">No enquiries yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/enquiries/${e.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-2/50"
                >
                  <StatusPill status={e.status} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-fg">
                      {e.name} <span className="font-normal text-muted">· {e.type}</span>
                    </span>
                    <span className="block truncate text-sm text-muted">{e.message}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(e.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} className="text-xs font-medium text-accent-ink hover:underline">
      View all
    </Link>
  );
}
