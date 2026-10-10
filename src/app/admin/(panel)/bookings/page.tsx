import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  EmptyState,
  FilterTabs,
  formatDateTime,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatusPill,
} from "@/components/admin/ui";
import { listBookings } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Bookings" };

export default function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ filter }) => (
        <Bookings upcoming={filter !== "all"} />
      ))}
    </Suspense>
  );
}

async function Bookings({ upcoming }: { upcoming: boolean }) {
  await requireAdmin();
  const db = getDb();
  const header = <PageHeader title="Bookings" description="Calls booked through Cal.com." />;
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }
  const rows = await listBookings(db, upcoming);

  return (
    <>
      {header}
      <FilterTabs
        active={upcoming ? "upcoming" : "all"}
        items={[
          { label: "Upcoming", value: "upcoming", href: "/admin/bookings" },
          { label: "All", value: "all", href: "/admin/bookings?filter=all" },
        ]}
      />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No bookings yet"
            body="Cal.com booking arrives in Phase 5. Booked calls will appear here automatically."
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((b) => (
              <li key={b.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="w-44 shrink-0 text-sm font-medium text-fg">
                  {formatDateTime(b.startTime)}
                </span>
                <span className="min-w-0 flex-1 text-sm text-fg">
                  {b.name ?? "Unknown"} <span className="text-muted">· {b.title}</span>
                </span>
                {b.email && (
                  <a href={`mailto:${b.email}`} className="text-sm text-accent-ink hover:underline">
                    {b.email}
                  </a>
                )}
                <StatusPill status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
