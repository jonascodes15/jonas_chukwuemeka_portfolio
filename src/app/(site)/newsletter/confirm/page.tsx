import type { Metadata } from "next";
import { Suspense } from "react";
import { confirmAction } from "@/server/actions/newsletter";
import { NewsletterPanel } from "../newsletter-panel";

export const metadata: Metadata = { title: "Confirm subscription", robots: { index: false } };

export default function ConfirmPage({ searchParams }: PageProps<"/newsletter/confirm">) {
  return (
    <section className="container-page py-24 md:py-32">
      <Suspense
        fallback={<div className="mx-auto h-72 max-w-lg rounded-card border border-border bg-surface" />}
      >
        {searchParams.then(({ token, status }) => (
          <NewsletterPanel
            state={status === "done" ? "done" : status === "invalid" ? "invalid" : "ask"}
            token={typeof token === "string" ? token : undefined}
            action={confirmAction}
            copy={{
              ask: {
                title: "Confirm your subscription",
                body: "Tap the button to start getting occasional notes on what I'm building and learning.",
                button: "Confirm subscription",
              },
              done: {
                title: "You're subscribed",
                body: "Thanks. You'll hear from me when there's something worth sharing. Every email has an unsubscribe link.",
              },
            }}
          />
        ))}
      </Suspense>
    </section>
  );
}
