import { ArrowLeft, CheckCircle2, CircleAlert, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/** Shared card for the confirm and unsubscribe pages. */
export function NewsletterPanel({
  state,
  token,
  action,
  copy,
}: {
  state: "ask" | "done" | "invalid";
  token?: string;
  action: (formData: FormData) => Promise<void>;
  copy: { ask: { title: string; body: string; button: string }; done: { title: string; body: string } };
}) {
  let icon: ReactNode = <Mail className="size-7 text-accent-ink" />;
  let title = copy.ask.title;
  let body: ReactNode = copy.ask.body;

  if (state === "done") {
    icon = <CheckCircle2 className="size-7 text-accent-ink" />;
    title = copy.done.title;
    body = copy.done.body;
  } else if (state === "invalid" || !token) {
    icon = <CircleAlert className="size-7 text-muted" />;
    title = "That link didn't work";
    body =
      "It may have expired or already been used. If you meant to subscribe, sign up again from the homepage.";
  }

  return (
    <div className="mx-auto max-w-lg rounded-card border border-border bg-surface p-8 sm:p-10">
      <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-surface-2">
        {icon}
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-fg">{title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {state === "ask" && token ? (
          <form action={action}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit">{copy.ask.button}</Button>
          </form>
        ) : null}
        <ButtonLink href="/" variant="secondary">
          <ArrowLeft aria-hidden className="size-4" />
          Back to the site
        </ButtonLink>
      </div>
    </div>
  );
}
