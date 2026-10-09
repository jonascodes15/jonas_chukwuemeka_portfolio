import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two-tone display heading: a solid first line over a muted second line.
 * e.g. <SectionHeading lead="Recent" trail="projects" />
 */
export function SectionHeading({
  eyebrow,
  lead,
  trail,
  as: Tag = "h2",
  description,
  className,
  id,
}: {
  eyebrow?: string;
  lead: string;
  trail: string;
  as?: "h1" | "h2";
  description?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("max-w-4xl", className)}>
      {eyebrow && (
        <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted uppercase">
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent" />
          {eyebrow}
        </p>
      )}
      <Tag id={id} className="font-display text-section font-extrabold uppercase">
        <span className="block text-fg">{lead}</span>
        <span className="block text-ghost">{trail}</span>
      </Tag>
      {description && <div className="mt-6 max-w-2xl text-lg text-muted">{description}</div>}
    </div>
  );
}
