import type { SocialLink } from "./types";

/** Social profiles. Used in the hero, contact section, footer and JSON-LD sameAs. */
export const socials: SocialLink[] = [
  // TODO: add LinkedIn profile URL.
  { key: "linkedin", label: "LinkedIn", href: null },
  { key: "github", label: "GitHub", href: "https://github.com/jonascodes15", handle: "jonascodes15" },
  { key: "x", label: "X", href: "https://x.com/JCK_ng", handle: "@JCK_ng" },
  // TODO: add Facebook profile URL.
  { key: "facebook", label: "Facebook", href: null },
];

export const activeSocials = socials.filter((s): s is SocialLink & { href: string } => s.href !== null);
