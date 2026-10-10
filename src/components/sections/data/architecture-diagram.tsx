"use client";

import { Cog, Database, MonitorSmartphone, Radio, Waves, Workflow, type LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Architecture, ArchitectureNode } from "@/content/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const KIND: Record<ArchitectureNode["kind"], { icon: LucideIcon; label: string }> = {
  source: { icon: Radio, label: "Source" },
  stream: { icon: Waves, label: "Stream" },
  store: { icon: Database, label: "Storage" },
  compute: { icon: Cog, label: "Processing" },
  serve: { icon: MonitorSmartphone, label: "Serving" },
  orchestrate: { icon: Workflow, label: "Orchestration" },
};

interface EdgePath {
  key: string;
  from: string;
  to: string;
  d: string;
  label?: string;
  labelX: number;
  labelY: number;
  control: boolean;
}

type Box = { l: number; t: number; r: number; b: number };

/** Straight lines where boxes line up, a soft S-curve otherwise. Runs from `a` towards `b`. */
function route(a: Box, b: Box): { d: string; mx: number; my: number } {
  const xl = Math.max(a.l, b.l);
  const xr = Math.min(a.r, b.r);
  if (xr - xl > 12) {
    const x = (xl + xr) / 2;
    const [y1, y2] = b.t >= a.b ? [a.b, b.t] : [a.t, b.b];
    return { d: `M ${x} ${y1} L ${x} ${y2}`, mx: x, my: (y1 + y2) / 2 };
  }
  const yt = Math.max(a.t, b.t);
  const yb = Math.min(a.b, b.b);
  if (yb - yt > 12) {
    const y = (yt + yb) / 2;
    const [x1, x2] = b.l >= a.r ? [a.r, b.l] : [a.l, b.r];
    return { d: `M ${x1} ${y} L ${x2} ${y}`, mx: (x1 + x2) / 2, my: y };
  }
  const x1 = (a.l + a.r) / 2;
  const x2 = (b.l + b.r) / 2;
  const [y1, y2] = b.t >= a.b ? [a.b, b.t] : [a.t, b.b];
  const my = (y1 + y2) / 2;
  return { d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my };
}

/**
 * Architecture diagram: nodes are HTML in a CSS grid (so text stays crisp and responsive),
 * connections are an SVG overlay measured from the rendered boxes. Data edges carry moving
 * "packets"; dashed edges are orchestration. Hovering a node highlights its connections.
 */
export function ArchitectureDiagram({
  architecture,
  title,
  compact = false,
  className,
}: {
  architecture: Architecture;
  /** Used for the accessible description, e.g. "BioStreamer". */
  title: string;
  compact?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());
  const [paths, setPaths] = useState<EdgePath[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const inView = useInView(containerRef, { margin: "0px 0px -15% 0px" });
  const seen = useInView(containerRef, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const markerId = useMemo(
    () => `arrow-${title.replace(/\W/g, "")}-${compact ? "c" : "f"}`,
    [title, compact],
  );

  const byId = useMemo(() => new Map(architecture.nodes.map((n) => [n.id, n])), [architecture.nodes]);
  const order = useMemo(() => {
    // Reveal order: top to bottom, left to right.
    const sorted = [...architecture.nodes].sort((a, b) => a.row - b.row || a.col - b.col);
    return new Map(sorted.map((n, i) => [n.id, i]));
  }, [architecture.nodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const origin = container.getBoundingClientRect();
      const box = (id: string): Box | null => {
        const el = nodeRefs.current.get(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          l: r.left - origin.left,
          t: r.top - origin.top,
          r: r.right - origin.left,
          b: r.bottom - origin.top,
        };
      };
      const next: EdgePath[] = [];
      for (const e of architecture.edges) {
        const a = box(e.from);
        const b = box(e.to);
        if (!a || !b) continue;
        const { d, mx, my } = route(a, b);
        next.push({
          key: `${e.from}-${e.to}`,
          from: e.from,
          to: e.to,
          d,
          label: e.label,
          labelX: mx,
          labelY: my,
          control: !!e.control,
        });
      }
      setPaths(next);
    };
    // ResizeObserver fires once on observe, which gives the first measurement.
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    nodeRefs.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [architecture.edges]);

  const connected = (id: string) =>
    active === null ||
    id === active ||
    architecture.edges.some((e) => (e.from === active && e.to === id) || (e.to === active && e.from === id));

  const description = architecture.edges
    .map((e) => {
      const from = byId.get(e.from)?.label;
      const to = byId.get(e.to)?.label;
      return `${from} ${e.control ? "orchestrates" : "feeds"} ${to}${e.label ? ` (${e.label})` : ""}.`;
    })
    .join(" ");

  const lastNodeDelay = 0.1 + architecture.nodes.length * 0.08;

  return (
    <figure className={cn("relative", className)}>
      <figcaption className="sr-only">
        {title} architecture. {description}
      </figcaption>
      <div ref={containerRef} aria-hidden className="relative">
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L8 4 L0 8 z" className="fill-muted" />
            </marker>
          </defs>
          {paths.map((p, i) => {
            const lit = active !== null && (p.from === active || p.to === active);
            const dim = active !== null && !lit;
            return (
              <g key={p.key} className="transition-opacity duration-300" style={{ opacity: dim ? 0.2 : 1 }}>
                <motion.path
                  d={p.d}
                  fill="none"
                  strokeWidth={lit ? 2 : 1.5}
                  strokeDasharray={p.control ? "5 6" : undefined}
                  markerEnd={`url(#${markerId})`}
                  className={cn(
                    "transition-colors duration-300",
                    lit ? "stroke-accent-ink" : "stroke-border-strong",
                  )}
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: seen ? 1 : reduce ? 1 : 0 }}
                  transition={{
                    duration: 0.9,
                    ease: EASE,
                    delay: reduce ? 0 : lastNodeDelay * 0.5 + i * 0.08,
                  }}
                />
                {!p.control && !reduce && inView && (
                  <circle r={compact ? 2.5 : 3} className="fill-accent-ink">
                    <animateMotion
                      dur={`${compact ? 2.2 : 2.6}s`}
                      begin={`${(i * 0.37) % 2.2}s`}
                      repeatCount="indefinite"
                      path={p.d}
                      keyPoints="0;1"
                      keyTimes="0;1"
                      calcMode="linear"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {!compact &&
          paths
            .filter((p) => p.label)
            .map((p) => (
              <span
                key={`l-${p.key}`}
                className="pointer-events-none absolute z-10 -translate-y-1/2 rounded-md bg-lab px-1.5 py-0.5 font-mono text-[0.62rem] leading-none text-muted transition-opacity duration-300"
                style={{
                  left: p.labelX + 6,
                  top: p.labelY,
                  opacity: active !== null && p.from !== active && p.to !== active ? 0.2 : 1,
                }}
              >
                {p.label}
              </span>
            ))}

        <div
          className={cn("relative grid", compact ? "gap-x-3 gap-y-5" : "gap-x-4 gap-y-8 sm:gap-x-6")}
          style={{ gridTemplateColumns: `repeat(${architecture.cols}, minmax(0, 1fr))` }}
        >
          {architecture.nodes.map((n) => {
            const { icon: Icon, label } = KIND[n.kind];
            const on = active === n.id;
            return (
              <motion.div
                key={n.id}
                ref={(el) => {
                  if (el) nodeRefs.current.set(n.id, el);
                  else nodeRefs.current.delete(n.id);
                }}
                onPointerEnter={() => setActive(n.id)}
                onPointerLeave={() => setActive(null)}
                initial={{ opacity: 0, y: 10 }}
                animate={seen ? { opacity: connected(n.id) ? 1 : 0.35, y: 0 } : undefined}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                  delay: active === null && seen ? 0.1 + (order.get(n.id) ?? 0) * 0.08 : 0,
                }}
                style={{ gridColumn: `${n.col} / span ${n.colSpan ?? 1}`, gridRow: n.row }}
                className={cn(
                  "relative z-10 flex min-w-0 items-center gap-2.5 rounded-xl border bg-surface transition-[border-color,box-shadow] duration-300",
                  compact ? "px-2.5 py-2" : "px-3 py-2.5 sm:px-3.5 sm:py-3",
                  n.kind === "orchestrate" ? "border-dashed" : "",
                  on ? "border-accent-ink shadow-[0_0_0_4px_var(--accent-glow)]" : "border-border-strong",
                )}
              >
                <span
                  title={label}
                  className={cn(
                    "shrink-0 place-items-center rounded-lg transition-colors duration-300",
                    compact ? "hidden min-[420px]:grid" : "hidden sm:grid",
                    compact ? "size-6" : "size-8",
                    on ? "bg-accent text-accent-contrast" : "bg-surface-2 text-accent-ink",
                  )}
                >
                  <Icon className={compact ? "size-3.5" : "size-4"} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block leading-snug font-semibold tracking-tight text-fg",
                      compact ? "text-[0.72rem]" : "text-[0.8rem] sm:text-sm",
                    )}
                  >
                    {n.label}
                  </span>
                  {n.detail && (
                    <span
                      className={cn(
                        "mt-0.5 block font-mono leading-snug text-muted",
                        compact ? "text-[0.6rem]" : "text-[0.62rem] sm:text-[0.68rem]",
                      )}
                    >
                      {n.detail}
                    </span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </figure>
  );
}
