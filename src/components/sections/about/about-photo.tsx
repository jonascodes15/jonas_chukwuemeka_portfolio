"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";

/** Full-length photo that drifts slightly inside its frame while the section scrolls. */
export function AboutPhoto({ alt }: { alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[1.9rem] border border-dashed border-border-strong"
      />
      <div className="relative aspect-[772/1080] overflow-hidden rounded-card border border-border-strong bg-surface-2">
        <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[7%]">
          <Image
            src="/images/me-full.jpg"
            alt={alt}
            fill
            sizes="(min-width: 1024px) 420px, (min-width: 640px) 60vw, 90vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}
