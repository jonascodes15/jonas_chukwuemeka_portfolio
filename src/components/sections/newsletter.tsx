"use client";

import { ArrowRight, Loader2, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { startTransition, useActionState, useId, useState, type FormEvent } from "react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { subscribe, type FormState } from "@/server/actions/forms";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Newsletter({ heading, body }: { heading: string; body: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(subscribe, { status: "idle" });
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (!EMAIL_RE.test(String(data.get("email") ?? "").trim())) {
      setError("Please enter a valid email address.");
      document.getElementById(id)?.focus();
      return;
    }
    setError(null);
    startTransition(() => formAction(data));
  };

  const message = error ?? (state.status !== "idle" && !pending ? state.message : null);

  return (
    <section aria-labelledby={`${id}-title`} className="container-page py-6">
      <Reveal className="relative isolate overflow-hidden rounded-card border border-border bg-surface p-6 sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_left,black,transparent_60%)]"
        />
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <div>
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted uppercase">
              <Mail aria-hidden className="size-3.5 text-accent-ink" />
              Newsletter
            </p>
            <h2
              id={`${id}-title`}
              className="mt-4 font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="mt-3 max-w-md text-muted">{body}</p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <label htmlFor={id} className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id={id}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                aria-invalid={!!error}
                aria-describedby={`${id}-msg`}
                className={cn(inputClasses, "h-13 sm:flex-1")}
              />
              {/* Honeypot for bots. */}
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <Button type="submit" size="lg" disabled={pending} data-track="newsletter:subscribe">
                {pending ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform group-hover/btn:translate-x-0.5"
                  />
                )}
                Subscribe
              </Button>
            </div>
            <div id={`${id}-msg`} aria-live="polite" className="mt-3 min-h-5 text-sm">
              <AnimatePresence mode="wait">
                {message ? (
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={error ? "text-red-600 dark:text-red-400" : "text-fg"}
                  >
                    {message}
                  </motion.p>
                ) : (
                  <p className="text-muted">
                    You&apos;ll get a confirmation email first. Unsubscribe any time.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
