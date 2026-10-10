"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ChipList } from "@/components/ui/chip";
import type { ExperienceItem } from "@/content/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Vertical timeline whose line fills as you scroll. Each role expands to show details and skills. */
export function ExperienceTimeline({ items }: { items: (ExperienceItem & { range: string })[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <ol ref={listRef} className="relative">
      {/* Track and scroll-linked fill. */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[0.9375rem] w-px bg-border md:left-[13.6875rem]"
      />
      <motion.span
        aria-hidden
        style={{ scaleY: fill }}
        className="absolute top-2 bottom-2 left-[0.9375rem] w-px origin-top bg-accent-ink md:left-[13.6875rem]"
      />
      {items.map((item, i) => (
        <TimelineEntry
          key={`${item.organisation}-${item.start}`}
          item={item}
          index={i}
          defaultOpen={i === 0}
        />
      ))}
    </ol>
  );
}

function TimelineEntry({
  item,
  index,
  defaultOpen,
}: {
  item: ExperienceItem & { range: string };
  index: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const current = item.end === null;

  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.05 }}
      className="relative grid gap-3 pb-10 pl-10 last:pb-0 md:grid-cols-[12rem_1fr] md:gap-12 md:pl-0"
    >
      {/* Dot on the line. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1.5 left-1 grid size-[1.4rem] place-items-center rounded-full border bg-bg md:left-[13rem]",
          current ? "border-accent-ink" : "border-border-strong",
        )}
      >
        <span
          className={cn("size-2 rounded-full", current ? "animate-pulse-dot bg-accent" : "bg-border-strong")}
        />
      </span>

      <div className="md:pt-1 md:text-right">
        <p className="font-mono text-xs tracking-wide text-muted">{item.range}</p>
        {current && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-accent px-2.5 py-0.5 font-mono text-[0.65rem] font-medium tracking-wide text-accent-contrast uppercase">
            Current
          </p>
        )}
      </div>

      <article className="rounded-card border border-border bg-surface p-5 transition-colors duration-300 hover:border-border-strong sm:p-7 md:ml-0">
        <div className="flex items-start gap-4">
          {item.logo && (
            <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
              <Image src={item.logo} alt="" fill sizes="48px" className="object-contain" />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold tracking-tight text-fg sm:text-2xl">
              {item.title}
            </h3>
            <p className="mt-0.5 text-[0.95rem] text-fg">
              {item.organisation}
              {item.orgNote && <span className="text-muted">, {item.orgNote}</span>}
            </p>
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
              {[item.type, item.workplace, item.location].filter(Boolean).map((t) => (
                <span key={t}>{t}</span>
              ))}
            </p>
          </div>
        </div>

        <p className="mt-5 leading-relaxed text-muted">{item.summary}</p>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="mt-4 inline-flex items-center gap-1.5 rounded-pill text-sm font-medium text-fg transition-colors hover:text-accent-ink"
        >
          {open ? "Hide details" : "Show details"}
          <ChevronDown
            aria-hidden
            className={cn("size-4 transition-transform duration-300 ease-out-expo", open && "rotate-180")}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden"
            >
              <ul className="mt-4 space-y-2.5 border-t border-border pt-5">
                {item.details.map((d) => (
                  <li key={d} className="flex gap-3 text-[0.95rem] leading-relaxed text-fg">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-ink" />
                    {d}
                  </li>
                ))}
              </ul>
              <ChipList items={item.skills} className="mt-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.li>
  );
}
