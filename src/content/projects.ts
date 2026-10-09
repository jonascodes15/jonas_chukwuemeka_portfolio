import type { Project, Store } from "./types";

/**
 * Product work shown in the Work section and on /work/[slug].
 * To add screenshots: drop images into /public/projects/<slug>/ and list them in `screenshots`.
 * Case-study copy (`caseStudy`) is written in Phase 3.
 */

export const projects: Project[] = [
  {
    slug: "weblanda",
    name: "Weblanda",
    tagline: "Online stores for Nigerian small businesses, run entirely from a phone.",
    summary:
      "A multi-tenant SaaS e-commerce platform that gives Nigerian small businesses their own online store, with real checkout, delivery and a seller dashboard, all manageable from a phone. Every store runs on its own subdomain.",
    highlights: [
      "Sellers are paid directly into their own Paystack subaccounts. Money never passes through Weblanda.",
      "Weblanda takes no cut of sales.",
      "Built solo: product, engineering, payments, brand and content.",
    ],
    stack: [
      "Next.js (App Router)",
      "Supabase (PostgreSQL)",
      "Vercel",
      "Wildcard subdomains",
      "Paystack subaccounts",
    ],
    links: [{ label: "Visit Weblanda", href: "https://weblanda.com", kind: "live" }],
    // TODO: add Weblanda screenshots (storefront, checkout, seller dashboard) to /public/projects/weblanda/.
    screenshots: [],
    screenshotDir: "/projects/weblanda",
    logo: "/logos/weblanda-mark.jpg",
  },
  {
    slug: "formtified",
    name: "Formtified",
    tagline: "AI-powered client onboarding forms for creators.",
    summary:
      "The creator describes a client's project, the AI asks up to four quick questions, then builds a tailored onboarding form and a share link. The client fills it in, the answers land in the creator's account, and an email alert goes out on every submission.",
    highlights: [
      "Tailored forms generated from a short description and up to four follow-up questions.",
      "Works with Groq or any OpenAI-compatible AI provider.",
      "Email and password auth with bcrypt and a signed cookie, plus Resend email alerts.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "MySQL (Aiven)",
      "mysql2",
      "Groq AI",
      "Resend",
      "Vercel",
    ],
    links: [
      // TODO: add the Formtified live demo URL.
      { label: "Live demo", href: null, kind: "live" },
      // TODO: add the Formtified GitHub README URL.
      { label: "How it's built", href: null, kind: "readme" },
    ],
    // TODO: add Formtified screenshots to /public/projects/formtified/.
    screenshots: [],
    screenshotDir: "/projects/formtified",
  },
];

// TODO: confirm each seller has agreed to be featured.
export const stores: Store[] = [
  {
    name: "Veek3Footies",
    description: "Premium handmade sandals, slides and mules.",
    href: "https://veek3footies.weblanda.shop",
  },
  {
    name: "JaneluxBeads",
    description: "Handcrafted beaded bags and statement jewellery.",
    href: "https://janeluxbeads.weblanda.shop",
  },
  {
    name: "JBOSS Furnitures",
    description: "Furniture craftsmanship.",
    // TODO: add the JBOSS Furnitures store URL.
    href: null,
  },
];
// TODO: add store logos to /public/projects/<store-slug>/ and set `logo` on each store.

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
