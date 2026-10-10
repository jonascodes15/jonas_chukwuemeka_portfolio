"use client";

import { ArrowRight, CheckCircle2, ChevronDown, CircleAlert, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { startTransition, useActionState, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { sendEnquiry, type FormState } from "@/server/actions/forms";
import { cn } from "@/lib/utils";

const MESSAGE_MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  enquiryTypes: readonly string[];
  budgetRanges: readonly string[];
}

/** Remounting the inner form (new key) is the simplest way to start a fresh enquiry after sending. */
export function ContactForm(props: Props) {
  const [round, setRound] = useState(0);
  return <EnquiryForm key={round} {...props} onReset={() => setRound((r) => r + 1)} />;
}

function EnquiryForm({ enquiryTypes, budgetRanges, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(sendEnquiry, { status: "idle" });
  const [type, setType] = useState<string>(enquiryTypes[0]);
  const [messageLength, setMessageLength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const fieldErrors = { ...(state.status === "error" ? state.fieldErrors : undefined), ...errors };

  // Submitting through onSubmit (not the form's action prop) stops React from clearing the
  // fields when the server returns an error. Quick checks run first; the server validates again.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Please tell me your name.";
    if (!EMAIL_RE.test(String(data.get("email") ?? "").trim()))
      next.email = "Please enter a valid email address.";
    if (String(data.get("message") ?? "").trim().length < 10)
      next.message = "A sentence or two helps me reply properly.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById(id(Object.keys(next)[0]))?.focus();
      return;
    }
    startTransition(() => formAction(data));
  };

  if (state.status === "success") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface-2 p-6"
      >
        <CheckCircle2 aria-hidden className="size-8 text-accent-ink" />
        <p className="font-display text-2xl font-bold tracking-tight text-fg">Message sent.</p>
        <p className="text-muted">{state.message}</p>
        <Button variant="secondary" onClick={onReset}>
          Send another message
        </Button>
      </motion.div>
    );
  }

  const describedBy = (name: string) => (fieldErrors[name] ? `${id(name)}-error` : undefined);

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-fg">What&apos;s this about?</legend>
        <div className="flex flex-wrap gap-2">
          {enquiryTypes.map((t) => (
            <label key={t} className="relative cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-10 items-center rounded-pill border px-4 text-sm transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink",
                  type === t
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border-strong text-muted hover:border-fg hover:text-fg",
                )}
              >
                {t}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id("name")} label="Name" error={fieldErrors.name}>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            maxLength={120}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={describedBy("name")}
            className={inputClasses}
          />
        </Field>
        <Field id={id("email")} label="Email" error={fieldErrors.email}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={describedBy("email")}
            className={inputClasses}
          />
        </Field>
      </div>

      <AnimatePresence initial={false}>
        {type === "Project" && (
          <motion.div
            key="budget"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="-m-1 overflow-hidden p-1"
          >
            <Field id={id("budget")} label="Budget" optional>
              <div className="relative">
                <select
                  id={id("budget")}
                  name="budget"
                  defaultValue=""
                  className={cn(inputClasses, "appearance-none pr-11")}
                >
                  <option value="" disabled>
                    Choose a range
                  </option>
                  {budgetRanges.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
                />
              </div>
            </Field>
          </motion.div>
        )}
      </AnimatePresence>

      <Field
        id={id("message")}
        label="Message"
        error={fieldErrors.message}
        hint={
          <span className="flex justify-between">
            <span>
              {type === "Project"
                ? "What does the business do, and what do you want built?"
                : "A few lines is plenty."}
            </span>
            <span className="tabular-nums">
              {messageLength}/{MESSAGE_MAX}
            </span>
          </span>
        }
      >
        <textarea
          id={id("message")}
          name="message"
          rows={6}
          required
          maxLength={MESSAGE_MAX}
          onChange={(e) => setMessageLength(e.target.value.length)}
          aria-invalid={!!fieldErrors.message}
          aria-describedby={describedBy("message") ?? `${id("message")}-hint`}
          className={cn(inputClasses, "resize-y")}
        />
      </Field>

      {/* Honeypot for bots. Hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              Send message
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover/btn:translate-x-0.5"
              />
            </>
          )}
        </Button>
        <p className="text-xs text-muted">Your details are only used to reply to you.</p>
      </div>

      <div aria-live="polite" role="status">
        <AnimatePresence mode="wait">
          {state.status === "error" && !pending && (
            <motion.p
              key={state.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-border-strong bg-surface-2 p-4 text-sm text-fg"
            >
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
