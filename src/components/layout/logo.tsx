import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name}, home`}
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-xl bg-accent font-display text-[0.95rem] font-extrabold tracking-tight text-accent-contrast transition-transform duration-300 ease-out-expo group-hover:-rotate-6"
      >
        JC
      </span>
      <span className="font-display text-[1.05rem] leading-none font-bold tracking-tight">
        Jonas<span className="hidden text-muted sm:inline"> Chukwuemeka</span>
      </span>
    </Link>
  );
}
