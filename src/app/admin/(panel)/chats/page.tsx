import { MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  EmptyState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  timeAgo,
} from "@/components/admin/ui";
import { listChats } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Chat logs" };

export default function ChatsPage({ searchParams }: PageProps<"/admin/chats">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ filter }) => (
        <Chats unanswered={filter === "unanswered"} />
      ))}
    </Suspense>
  );
}

async function Chats({ unanswered }: { unanswered: boolean }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Chat logs"
      description="Questions asked in the FAQ chat. Unanswered ones show what to add to the FAQ next."
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
  const rows = await listChats(db, unanswered);

  return (
    <>
      {header}
      <FilterTabs
        active={unanswered ? "unanswered" : "all"}
        items={[
          { label: "All", value: "all", href: "/admin/chats" },
          { label: "Unanswered", value: "unanswered", href: "/admin/chats?filter=unanswered" },
        ]}
      />
      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={MessageCircleQuestion}
            title="No questions yet"
            body="The FAQ chat widget arrives in Phase 5. Questions people type will be logged here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span
                  className={`w-24 shrink-0 font-mono text-[0.65rem] uppercase ${c.answered ? "text-muted" : "text-accent-ink"}`}
                >
                  {c.answered ? `Answered` : "Unanswered"}
                </span>
                <span className="min-w-0 flex-1 text-sm text-fg">{c.question}</span>
                {c.email && (
                  <a href={`mailto:${c.email}`} className="text-sm text-accent-ink hover:underline">
                    {c.email}
                  </a>
                )}
                <span className="shrink-0 text-xs text-muted">{timeAgo(c.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
