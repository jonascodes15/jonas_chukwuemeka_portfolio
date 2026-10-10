import type { Metadata } from "next";
import { Suspense } from "react";
import { formatDateTime, PageHeader, PageSkeleton, Panel, SetupNotice } from "@/components/admin/ui";
import { listIssues, statusCounts } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { Composer } from "./composer";

export const metadata: Metadata = { title: "Newsletter" };

export default function NewsletterPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Newsletter />
    </Suspense>
  );
}

async function Newsletter() {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Newsletter"
      description="Write an issue, send yourself a test, then send it to every confirmed subscriber."
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

  const [counts, issues] = await Promise.all([statusCounts(db, "subscribers"), listIssues(db)]);

  return (
    <>
      {header}
      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <Panel title="New issue">
          <Composer recipients={counts.confirmed ?? 0} />
        </Panel>
        <Panel title="Sent" bodyClassName="p-0">
          {issues.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {issues.map((i) => (
                <li key={i.id} className="px-5 py-3.5">
                  <p className="truncate text-sm font-medium text-fg">{i.subject}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(i.sentAt)} · {i.recipientCount} sent
                    {i.failedCount > 0 && `, ${i.failedCount} failed`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
