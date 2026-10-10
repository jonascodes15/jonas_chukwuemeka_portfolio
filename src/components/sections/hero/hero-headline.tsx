"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const WORD_STEP = 0.06;
const FIRST_DELAY = 0.15;

/**
 * Headline that rises in word by word from behind a mask, then sweeps a lime highlight
 * behind the `highlight` phrase (a run of words inside `text`). The highlight is plain CSS
 * animation (see `highlight-sweep` and `ink` in globals.css), so it costs no JavaScript.
 */
export function HeroHeadline({ text, highlight }: { text: string; highlight: string }) {
  const start = text.indexOf(highlight);
  if (start < 0) return <Words list={split(text)} offset={0} />;

  const before = split(text.slice(0, start));
  const marked = split(highlight);
  const rest = text.slice(start + highlight.length);
  const after = split(rest);
  const sweepAt = FIRST_DELAY + (before.length + marked.length) * WORD_STEP + 0.3;

  return (
    <>
      <Words list={before} offset={0} />{" "}
      <span
        className="relative isolate inline-block whitespace-nowrap"
        style={{ animation: `ink 0.4s ease-out ${sweepAt + 0.25}s both` }}
      >
        <span
          aria-hidden
          className="absolute -inset-x-[0.1em] top-[0.06em] bottom-[0.1em] -z-10 origin-left rounded-[0.1em] bg-accent"
          style={{ animation: `highlight-sweep 0.9s var(--ease-out-expo) ${sweepAt}s both` }}
        />
        <Words list={marked} offset={before.length} />
      </span>
      {/^\s/.test(rest) ? " " : null}
      <Words list={after} offset={before.length + marked.length} />
    </>
  );
}

function split(s: string) {
  return s.split(/\s+/).filter(Boolean);
}

function Words({ list, offset }: { list: string[]; offset: number }) {
  return list.map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="inline-block overflow-hidden pb-[0.08em] align-top">
        <motion.span
          className="inline-block"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: FIRST_DELAY + (offset + i) * WORD_STEP }}
        >
          {word}
        </motion.span>
      </span>
    </span>
  ));
}
