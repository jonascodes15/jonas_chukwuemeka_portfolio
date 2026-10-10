import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
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
      <LogoMark className="size-9 text-accent-ink transition-transform duration-500 ease-out-expo group-hover:scale-105" />
      <span className="font-display text-[1.05rem] leading-none font-bold tracking-tight">
        Jonas<span className="hidden text-muted sm:inline"> Chukwuemeka</span>
      </span>
    </Link>
  );
}
