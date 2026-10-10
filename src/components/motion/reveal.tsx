"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fades and lifts its children in the first time they scroll into view.
 * With reduced motion on, MotionConfig drops the movement and keeps a quick fade.
 */
export function Reveal({
  delay = 0,
  y = 28,
  as = "div",
  ...props
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; as?: "div" | "li" | "article" }) {
  // The element changes, the props do not: typing them all as a div keeps one signature.
  const Component = (
    as === "li" ? motion.li : as === "article" ? motion.article : motion.div
  ) as typeof motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      {...props}
    />
  );
}

/** Container that staggers its <RevealItem> children as it enters the viewport. */
export function RevealGroup({
  stagger = 0.08,
  delay = 0,
  as = "div",
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number; as?: "div" | "ul" | "ol" }) {
  const Component = (as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div) as typeof motion.div;
  return (
    <Component
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...props}
    />
  );
}

export function RevealItem({
  y = 24,
  as = "div",
  ...props
}: HTMLMotionProps<"div"> & { y?: number; as?: "div" | "li" }) {
  const Component = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <Component
      variants={{
        hidden: { opacity: 0, y },
        shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      }}
      {...props}
    />
  );
}
