import { Check } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { ChipList } from "@/components/ui/chip";
import type { Project, Screenshot } from "@/content/types";
import { cn } from "@/lib/utils";
import { DeviceStack } from "./device-stack";
import { ProjectLinks } from "./project-links";

/** Large two-column card for a flagship product: story on one side, devices on the other. */
export function ProjectFeature({
  project,
  label,
  desktop,
  phone,
  url,
  demoNote,
  reverse = false,
}: {
  project: Project;
  /** Small mono line above the name, e.g. "01 / Founder". */
  label: string;
  desktop: Screenshot;
  phone: Screenshot;
  url: string;
  demoNote: string;
  reverse?: boolean;
}) {
  return (
    <Reveal as="article" aria-labelledby={`${project.slug}-name`} className="rounded-card">
      <Spotlight className="grid overflow-hidden rounded-card border border-border bg-surface lg:grid-cols-[0.92fr_1.08fr]">
        <div className={cn("flex flex-col p-6 sm:p-10 lg:p-12", reverse && "lg:order-2")}>
          <div className="flex items-center gap-3">
            {project.logo && (
              <span className="relative size-10 overflow-hidden rounded-xl border border-border">
                <Image src={project.logo} alt="" fill sizes="40px" className="object-cover" />
              </span>
            )}
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">{label}</p>
          </div>

          <h3
            id={`${project.slug}-name`}
            className="mt-6 font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl"
          >
            {project.name}
          </h3>
          <p className="mt-3 text-lg font-medium text-fg sm:text-xl">{project.tagline}</p>
          <p className="mt-4 leading-relaxed text-muted">{project.summary}</p>

          <ul className="mt-6 space-y-3">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[0.95rem] leading-relaxed text-fg">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-contrast">
                  <Check aria-hidden className="size-3" strokeWidth={3} />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <ChipList items={project.stack} className="mt-7" />

          <div className="mt-auto pt-9">
            <ProjectLinks
              links={project.links}
              caseStudyHref={project.caseStudy ? `/work/${project.slug}` : undefined}
              name={project.name}
            />
          </div>
        </div>

        <div
          className={cn(
            "relative isolate overflow-hidden border-t border-border bg-surface-2/60 lg:border-t-0",
            reverse ? "lg:order-1 lg:border-r" : "lg:border-l",
          )}
        >
          <div
            aria-hidden
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          />
          <div className="flex h-full flex-col justify-center">
            <DeviceStack desktop={desktop} phone={phone} url={url} reverse={reverse} />
          </div>
          <p
            className={cn(
              "absolute bottom-3 font-mono text-[0.65rem] tracking-wide text-muted",
              reverse ? "right-5" : "left-5",
            )}
          >
            {demoNote}
          </p>
        </div>
      </Spotlight>
    </Reveal>
  );
}
