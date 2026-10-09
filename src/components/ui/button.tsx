import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-contrast hover:shadow-[0_8px_30px_-6px_var(--accent-glow)] hover:brightness-[1.04]",
  secondary: "border border-border-strong bg-transparent text-fg hover:border-fg hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

/** Internal navigation (uses next/link). */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}

/** External links and downloads. Opens external URLs in a new tab. */
export function ButtonAnchor({
  variant,
  size,
  className,
  external,
  ...props
}: CommonProps & ComponentProps<"a"> & { external?: boolean }) {
  return (
    <a
      className={buttonClasses({ variant, size, className })}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    />
  );
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: CommonProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}
