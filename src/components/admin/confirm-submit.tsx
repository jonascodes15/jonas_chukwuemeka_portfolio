"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

/** Submit button that asks for confirmation first, for destructive actions. */
export function ConfirmSubmit({
  message,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { message: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className={cn("disabled:opacity-50", className)}
      {...props}
    >
      {children}
    </button>
  );
}
