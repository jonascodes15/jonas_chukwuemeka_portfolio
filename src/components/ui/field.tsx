import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputClasses =
  "w-full rounded-xl border border-border-strong bg-bg px-4 py-3 text-[0.95rem] text-fg placeholder:text-ghost transition-[border-color,box-shadow] duration-200 outline-none hover:border-muted focus-visible:border-accent-ink focus-visible:shadow-[0_0_0_4px_var(--accent-glow)] focus-visible:outline-none aria-[invalid=true]:border-red-600 dark:aria-[invalid=true]:border-red-400";

/** Label, control and error text wired together for screen readers. */
export function Field({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
