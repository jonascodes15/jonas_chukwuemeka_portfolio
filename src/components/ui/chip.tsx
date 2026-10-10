import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small mono label for tech stacks and tags. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-surface-2/60 px-2.5 py-1 font-mono text-[0.7rem] leading-none text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ChipList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}
