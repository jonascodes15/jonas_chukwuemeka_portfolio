import type { SocialLink } from "./types";

/** Social profiles. Used in the hero, contact section, footer and JSON-LD sameAs. */
export const socials: SocialLink[] = [
  {
    key: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jonas-chukwuemeka/",
    handle: "jonas-chukwuemeka",
  },
  { key: "github", label: "GitHub", href: "https://github.com/jonascodes15", handle: "jonascodes15" },
  { key: "x", label: "X", href: "https://x.com/JCK_ng", handle: "@JCK_ng" },
  {
    key: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/jonas.emeka.12/",
    handle: "jonas.emeka.12",
  },
];

export const activeSocials = socials.filter((s): s is SocialLink & { href: string } => s.href !== null);
