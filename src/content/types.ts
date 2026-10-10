/**
 * Shared types for everything in /src/content.
 * A value of `null` on a URL means "not available yet": the UI hides or disables that button
 * and the item is listed as a TODO.
 */

export type SocialKey = "linkedin" | "github" | "x" | "facebook";

export interface SocialLink {
  key: SocialKey;
  label: string;
  /** null until Jay provides the URL. */
  href: string | null;
  handle?: string;
}

export interface NavLink {
  label: string;
  /** Section id on the homepage, without the "#". */
  id: string;
}

export interface ProjectLink {
  label: string;
  href: string | null;
  kind: "live" | "github" | "readme" | "paper" | "x" | "linkedin" | "facebook";
}

/**
 * A pre-optimised image. Files live at `<dir>/<name>-<width>.<avif|webp>` for every entry in `widths`
 * (generated once from the full-size sources, so next/image does not re-encode them).
 */
export interface Screenshot {
  /** Folder under /public, e.g. "/projects/weblanda". */
  dir: string;
  name: string;
  widths: number[];
  /** Intrinsic size. Only the ratio matters; it reserves space before the image loads. */
  width: number;
  height: number;
  alt: string;
  title?: string;
  caption?: string;
  device: "desktop" | "phone";
}

/** Nodes and connections for the animated architecture diagram in the Data section. */
export interface ArchitectureNode {
  id: string;
  label: string;
  detail?: string;
  kind: "source" | "stream" | "store" | "compute" | "serve" | "orchestrate";
  /** Grid placement, 1-based. */
  col: number;
  row: number;
  colSpan?: number;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  /** Dashed: control flow (orchestration) rather than data. */
  control?: boolean;
}

export interface Architecture {
  cols: number;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

/** Case-study copy for /work/[slug]. Filled in Phase 3. */
export interface CaseStudy {
  problem: string[];
  built: string[];
  howItWorks: string[];
  stackWhy: { tech: string; why: string }[];
  challenges: string[];
}

export interface Project {
  slug: string;
  name: string;
  /** One line used on cards and as the case-study subtitle. */
  tagline: string;
  /** Short paragraph for the homepage card. */
  summary: string;
  highlights: string[];
  stack: string[];
  links: ProjectLink[];
  /** The first screenshot is the cover image. */
  screenshots: Screenshot[];
  logo?: string;
  caseStudy?: CaseStudy;
}

export interface DataProject extends Project {
  /** Real, verifiable figures only. Rendered with animated counters. */
  metrics?: { value: number; decimals?: number; prefix?: string; suffix?: string; label: string }[];
  /** True for the large featured card. */
  featured?: boolean;
  architecture?: Architecture;
}

export interface Store {
  name: string;
  description: string;
  href: string | null;
  logo?: { src: string; width: number; height: number; widths: number[]; background: string };
}

export interface ExperienceItem {
  title: string;
  organisation: string;
  orgNote?: string;
  type?: string;
  /** "YYYY-MM" */
  start: string;
  /** "YYYY-MM" or null for present. */
  end: string | null;
  location: string;
  workplace?: string;
  logo?: string;
  summary: string;
  details: string[];
  skills: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Lower-case words or phrases used to match typed questions. */
  keywords: string[];
  /** Optional call to action shown under the answer. */
  action?: { label: string; target: "contact" | "book" | "whatsapp" | "work" | "cv" };
}
