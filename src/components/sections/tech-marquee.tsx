import { TechIcon } from "@/components/icons/tech-icon";
import { techStack } from "@/content/stack";

/**
 * Endless strip of tools. Two copies of the list sit side by side and the track slides by
 * exactly one copy (-50%), so the loop is seamless. Pauses on hover; static with reduced motion.
 */
export function TechMarquee() {
  return (
    <section aria-label="Tools I work with" className="border-y border-border bg-surface/40">
      <div className="group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] py-6 sm:py-7">
        <div className="flex w-max animate-marquee [--marquee-duration:45s] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          <TechList />
          <TechList hidden />
        </div>
      </div>
    </section>
  );
}

function TechList({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
      aria-hidden={hidden || undefined}
    >
      {techStack.map((t) => (
        <li
          key={t.name}
          className="flex items-center gap-3 text-muted transition-colors duration-300 hover:text-fg"
        >
          <TechIcon name={t.icon} className="size-6 sm:size-7" />
          <span className="font-display text-lg font-semibold tracking-tight whitespace-nowrap sm:text-xl">
            {t.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
