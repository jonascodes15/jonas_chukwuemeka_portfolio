import { ArrowDown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/content/site";

/**
 * Phase 1 shell: section anchors and headings so navigation, theming and layout can be checked.
 * Phase 2 replaces each block with the full animated section component.
 */
export default function HomePage() {
  return (
    <>
      <section className="container-page flex min-h-[80dvh] flex-col justify-center py-20">
        <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-1.5 text-sm text-muted">
          <span aria-hidden className="size-2 animate-pulse-dot rounded-full bg-accent" />
          {site.hero.status}
        </p>
        <h1 className="max-w-5xl font-display text-display font-extrabold">
          <span className="sr-only">{site.name}. </span>
          {site.hero.headline}
        </h1>
        <p className="mt-6 text-xl font-medium text-fg">{site.hero.subline}</p>
        <p className="mt-3 max-w-2xl text-lg text-muted">{site.hero.supporting}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/#work" size="lg">
            {site.hero.primaryCta.label}
            <ArrowDown aria-hidden className="size-4 transition-transform group-hover/btn:translate-y-0.5" />
          </ButtonLink>
          <ButtonLink href="/#contact" size="lg" variant="secondary">
            {site.hero.secondaryCta.label}
          </ButtonLink>
        </div>
      </section>

      <ShellSection id="work" eyebrow="Selected work" lead="Recent" trail="Projects" />
      <ShellSection id="data" eyebrow="Data and research" lead="From the" trail="Lab" />
      <ShellSection id="experience" eyebrow="Experience" lead="Where I've" trail="Worked" />
      <ShellSection id="about" eyebrow="About" lead="Builder by" trail="Training" />
      <ShellSection id="contact" eyebrow="Contact" lead="Let's work" trail="Together" />
    </>
  );
}

function ShellSection(props: { id: string; eyebrow: string; lead: string; trail: string }) {
  return (
    <section
      id={props.id}
      aria-labelledby={`${props.id}-title`}
      className="container-page min-h-[70dvh] py-24"
    >
      <SectionHeading
        id={`${props.id}-title`}
        eyebrow={props.eyebrow}
        lead={props.lead}
        trail={props.trail}
      />
      <p className="mt-8 font-mono text-sm text-muted">Section content arrives in Phase 2.</p>
    </section>
  );
}
