"use client";

import { CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/field";
import { login, type LoginState } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPassword, setShowPassword] = useState(false);

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
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(inputClasses, "pr-12")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            aria-controls="admin-password"
            className="absolute inset-y-0 right-1.5 my-auto grid size-9 place-items-center rounded-lg text-muted transition-colors hover:text-fg"
          >
            {showPassword ? (
              <EyeOff aria-hidden className="size-4.5" />
            ) : (
              <Eye aria-hidden className="size-4.5" />
            )}
          </button>
        </div>
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
