import { Download, Trash2, Users } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
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
import { buttonClasses } from "@/components/ui/button";
import { deleteSubscriber } from "@/server/actions/admin";
import { listSubscribers, statusCounts } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Subscribers" };

const FILTERS = ["confirmed", "pending", "unsubscribed", "all"] as const;

export default function SubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ status }) => (
        <Subscribers status={FILTERS.find((f) => f === status) ?? "confirmed"} />
      ))}
    </Suspense>
  );
}

async function Subscribers({ status }: { status: (typeof FILTERS)[number] }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Subscribers"
      description="People who signed up to the newsletter. Only confirmed subscribers receive emails."
      actions={
        db && (
          <a
            href={`/admin/subscribers/export?status=${status}`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Download aria-hidden className="size-4" />
            Export CSV
          </a>
        )
      }
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

  const [rows, counts] = await Promise.all([listSubscribers(db, status), statusCounts(db, "subscribers")]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      {header}
      <FilterTabs
        active={status}
        items={[
          { label: "Confirmed", value: "confirmed", count: counts.confirmed ?? 0 },
          { label: "Pending", value: "pending", count: counts.pending ?? 0 },
          { label: "Unsubscribed", value: "unsubscribed", count: counts.unsubscribed ?? 0 },
          { label: "All", value: "all", count: total },
        ].map((i) => ({ ...i, href: `/admin/subscribers?status=${i.value}` }))}
      />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No subscribers here yet"
            body="Sign-ups from the newsletter form will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Signed up</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 text-fg">{s.email}</td>
                    <td className="px-5 py-3">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteSubscriber}>
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmSubmit
                          message={`Remove ${s.email} completely?`}
                          aria-label={`Remove ${s.email}`}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
