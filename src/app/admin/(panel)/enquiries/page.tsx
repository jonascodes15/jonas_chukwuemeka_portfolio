import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  EmptyState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatusPill,
  timeAgo,
} from "@/components/admin/ui";
import { listEnquiries, statusCounts } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };

const FILTERS = ["inbox", "new", "archived", "all"] as const;

export default function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ status }) => (
        <Enquiries status={FILTERS.find((f) => f === status) ?? "inbox"} />
      ))}
    </Suspense>
  );
}

async function Enquiries({ status }: { status: (typeof FILTERS)[number] }) {
  await requireAdmin();
  const db = getDb();
  const header = <PageHeader title="Enquiries" description="Messages sent through the contact form." />;
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }

  const [rows, counts] = await Promise.all([listEnquiries(db, status), statusCounts(db, "enquiries")]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      {header}
      <FilterTabs
        active={status}
        items={[
          { label: "Inbox", value: "inbox", count: total - (counts.archived ?? 0) },
          { label: "Unread", value: "new", count: counts.new ?? 0 },
          { label: "Archived", value: "archived", count: counts.archived ?? 0 },
          { label: "All", value: "all", count: total },
        ].map((i) => ({ ...i, href: `/admin/enquiries?status=${i.value}` }))}
      />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing here"
            body="New messages from the contact form will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/enquiries/${e.id}`}
                  className="flex flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-surface-2/50 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="flex items-center gap-3 sm:w-56 sm:shrink-0">
                    <StatusPill status={e.status} />
                    <span
                      className={cn(
                        "truncate text-sm",
                        e.status === "new" ? "font-semibold text-fg" : "text-fg",
                      )}
                    >
                      {e.name}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted">
                    <span className="text-fg">{e.type}</span>
                    {e.budget && <span> · {e.budget}</span>} · {e.message}
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
