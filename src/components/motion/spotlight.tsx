"use client";

import type { ComponentProps, PointerEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Card surface with a soft accent glow that follows the pointer.
 * The glow is pure CSS driven by two custom properties, so no re-renders happen on move.
 */
export function Spotlight({ className, children, ...props }: ComponentProps<"div">) {
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div onPointerMove={onPointerMove} className={cn("group/spot relative isolate", className)} {...props}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(520px circle at var(--spot-x, 50%) var(--spot-y, 0%), var(--accent-glow), transparent 65%)",
        }}
      />
      {children}
    </div>
  );
}
