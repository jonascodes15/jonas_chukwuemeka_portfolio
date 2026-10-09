"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        // Move focus back to the top of the document for keyboard and screen reader users.
        document.getElementById("top")?.focus({ preventScroll: true });
      }}
      className="group inline-flex items-center gap-2 rounded-pill border border-border px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-fg"
    >
      Back to top
      <ArrowUp
        aria-hidden
        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
      />
    </button>
  );
}
