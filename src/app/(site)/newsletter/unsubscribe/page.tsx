import type { Metadata } from "next";
import { Suspense } from "react";
import { unsubscribeAction } from "@/server/actions/newsletter";
import { NewsletterPanel } from "../newsletter-panel";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

export default function UnsubscribePage({ searchParams }: PageProps<"/newsletter/unsubscribe">) {
  return (
    <section className="container-page py-24 md:py-32">
      <Suspense
        fallback={<div className="mx-auto h-72 max-w-lg rounded-card border border-border bg-surface" />}
      >
        {searchParams.then(({ token, status }) => (
          <NewsletterPanel
            state={status === "done" ? "done" : status === "invalid" ? "invalid" : "ask"}
            token={typeof token === "string" ? token : undefined}
            action={unsubscribeAction}
            copy={{
              ask: {
                title: "Unsubscribe?",
                body: "You'll stop getting the newsletter. You can sign up again any time.",
                button: "Unsubscribe",
              },
              done: {
                title: "You're unsubscribed",
                body: "You won't get any more newsletters from me. Sorry to see you go.",
              },
            }}
          />
        ))}
      </Suspense>
    </section>
  );
}
