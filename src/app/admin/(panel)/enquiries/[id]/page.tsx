import { Archive, ArrowLeft, Inbox, Mail, MailOpen, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { formatDateTime, PageSkeleton, Panel, SetupNotice, StatusPill } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { deleteEnquiry, setEnquiryStatus } from "@/server/actions/admin";
import { getEnquiry } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb, schema } from "@/server/db";

export const metadata: Metadata = { title: "Enquiry" };

export default function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ id }) => (
        <Enquiry id={id} />
      ))}
    </Suspense>
  );
}

async function Enquiry({ id }: { id: string }) {
  await requireAdmin();
  const db = getDb();
  if (!db) return <SetupNotice />;
  const e = await getEnquiry(db, id);
  if (!e) notFound();

  // Opening a new enquiry marks it as read, like an inbox. It runs after the response,
  // so this view still shows "new" and the next one shows "read".
  if (e.status === "new") {
    after(() => db.update(schema.enquiries).set({ status: "read" }).where(eq(schema.enquiries.id, e.id)));
  }

  const replySubject = encodeURIComponent(`Re: your ${e.type.toLowerCase()} enquiry`);
  const statusButton = (status: "new" | "read" | "archived", label: string, Icon: typeof Mail) => (
    <form action={setEnquiryStatus}>
      <input type="hidden" name="id" value={e.id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
        <Icon aria-hidden className="size-4" />
        {label}
      </button>
    </form>
  );

  return (
    <>
      <Link
        href="/admin/enquiries"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All enquiries
      </Link>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <StatusPill status={e.status} />
            <span className="text-sm text-muted">{formatDateTime(e.createdAt)}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-fg">{e.name}</h1>
          <p className="mt-1 text-muted">
            <a href={`mailto:${e.email}`} className="text-accent-ink hover:underline">
              {e.email}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${e.email}?subject=${replySubject}`} className={buttonClasses({ size: "sm" })}>
            <Mail aria-hidden className="size-4" />
            Reply
          </a>
          {e.status === "new"
            ? statusButton("read", "Mark as read", MailOpen)
            : statusButton("new", "Mark as unread", Mail)}
          {e.status === "archived"
            ? statusButton("read", "Move to inbox", Inbox)
            : statusButton("archived", "Archive", Archive)}
          <form action={deleteEnquiry}>
            <input type="hidden" name="id" value={e.id} />
            <ConfirmSubmit
              message="Delete this enquiry for good?"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
              aria-label="Delete enquiry"
            >
              <Trash2 aria-hidden className="size-4" />
            </ConfirmSubmit>
          </form>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <Panel title="Message">
          <p className="leading-relaxed whitespace-pre-wrap text-fg">{e.message}</p>
        </Panel>
        <Panel title="Details">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted">Type</dt>
              <dd className="mt-0.5 text-fg">{e.type}</dd>
            </div>
            {e.budget && (
              <div>
                <dt className="text-muted">Budget</dt>
                <dd className="mt-0.5 text-fg">{e.budget}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Received</dt>
              <dd className="mt-0.5 text-fg">{formatDateTime(e.createdAt)}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  );
}
