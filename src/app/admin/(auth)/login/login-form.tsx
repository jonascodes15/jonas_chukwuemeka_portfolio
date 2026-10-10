"use client";

import { CircleAlert, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { login, type LoginState } from "@/server/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <Field id="admin-email" label="Email">
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          required
          className={inputClasses}
        />
      </Field>
      <Field id="admin-password" label="Password">
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </Field>
      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-border-strong bg-surface-2 p-3 text-sm text-fg"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
        Sign in
      </Button>
    </form>
  );
}
