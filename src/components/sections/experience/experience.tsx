import { Download } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ButtonAnchor } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { experience, formatRange } from "@/content/experience";
import { site } from "@/content/site";
import { ExperienceTimeline } from "./experience-timeline";

export function Experience() {
  const items = experience.map((e) => ({ ...e, range: formatRange(e.start, e.end) }));

  return (
    <section id="experience" aria-labelledby="experience-title" className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="experience-title" eyebrow="Experience" lead="Where I've" trail="Worked" />
          <Reveal className="flex max-w-sm flex-col items-start gap-5 lg:pb-3">
            <p className="text-muted">
              From the lab bench to production code: research, engineering and leadership roles, newest first.
            </p>
            <ButtonAnchor href={site.cv.href} download={site.cv.fileName} variant="secondary">
              <Download aria-hidden className="size-4 transition-transform group-hover/btn:translate-y-0.5" />
              Download CV
            </ButtonAnchor>
          </Reveal>
        </div>

        <div className="mt-14 md:mt-20">
          <ExperienceTimeline items={items} />
        </div>
      </div>
    </section>
  );
}
